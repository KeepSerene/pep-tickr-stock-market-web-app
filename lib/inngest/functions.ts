import { getAllUsers } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { sendDailyNewsEmail, sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Country: ${event.data.country}
        - Investment goals: ${event.data.investmentGoals}
        - Risk tolerance: ${event.data.riskTolerance}
        - Preferred industries: ${event.data.preferredIndustries}
    `;
    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile,
    );
    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.at(0)?.content?.parts?.at(0);
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining PepTickr! You now have the tools to track markets and make smarter moves.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
      success: true,
      message: "Welcome email sent successfully!",
    };
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [
    { event: "app/send.daily.news" }, // Manual trigger for testing
    // IST = UTC + 5:30
    // The cron format is: "minute hour day month dayOfWeek"
    { cron: "30 6 * * *" }, // Automated: every day at 12:00 noon IST (6:30 AM UTC)
  ],
  async ({ step }) => {
    // STEP 1 — Fetch the full user list.
    const users = await step.run("get-all-users", async () => {
      return await getAllUsers();
    });

    // Early exit if no users found
    if (!users || users.length === 0) {
      console.warn("No users found for sending daily news!");

      return {
        success: false,
        error: "No users found for sending daily news!",
      };
    }

    // We collect per-user results here so we can aggregate at the end.
    const results: Array<{
      userId: string;
      email: string;
      status: "success" | "error" | "skipped";
      articlesCount?: number;
      error?: string;
      reason?: string;
    }> = [];

    for (const user of users) {
      try {
        // ---------------------------------------------------------------
        // STEP 2 — Fetch watchlist symbols + news articles for this user.
        // ---------------------------------------------------------------

        const { newsArticles } = await step.run(
          `fetch-data-${user.id}`,
          async () => {
            // 2a. Pull the user's watchlist from MongoDB
            const watchlistSymbols = await getWatchlistSymbolsByEmail(
              user.email,
            );

            // 2b. Fetch personalized news (or general market news as fallback)
            const newsArticles = await getNews(
              watchlistSymbols.length > 0 ? watchlistSymbols : undefined,
            );

            return { newsArticles };
          },
        );

        // If there are no articles for this user, record "skipped" and
        // move straight to the next user — no AI call, no email.
        if (!newsArticles || newsArticles.length === 0) {
          console.warn(`⚠️ No news available for ${user.email}`);
          results.push({
            userId: user.id,
            email: user.email,
            status: "skipped",
            reason: "no-news",
          });

          continue; // skip to next iteration of the for-loop
        }

        // ---------------------------------------------------------------
        // STEP 3 — AI summarisation with Gemini.
        // ---------------------------------------------------------------
        const newsDataFormatted = newsArticles
          .map(
            (article, i) => `
                ${i + 1}. ${article.headline}
                Source: ${article.source}
                Summary: ${article.summary}
                URL: ${article.url}
                ${article.related ? `Related to: ${article.related}` : ""}
              `,
          )
          .join("\n");

        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          newsDataFormatted,
        );

        const newsSummary = await step.ai.infer(`summarize-news-${user.id}`, {
          model: step.ai.models.gemini({ model: "gemini-2.5-flash" }),
          body: {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          },
        });

        // Pull the text out of Gemini's response structure.
        // Falls back to a plain-text summary if the AI returns nothing.
        const summaryPart = newsSummary.candidates
          ?.at(0)
          ?.content?.parts?.at(0);
        const summaryText =
          (summaryPart && "text" in summaryPart ? summaryPart.text : null) ||
          generateFallbackSummary(newsArticles);

        // ---------------------------------------------------------------
        // STEP 4 — Send the email via Nodemailer.
        // ---------------------------------------------------------------
        await step.run(`send-email-${user.id}`, async () => {
          await sendDailyNewsEmail({
            email: user.email,
            name: user.name,
            summary: summaryText,
          });
        });

        results.push({
          userId: user.id,
          email: user.email,
          status: "success",
          articlesCount: newsArticles.length,
        });
      } catch (userError) {
        // Per-user error boundary.  One user failing does NOT stop the
        // loop — the remaining users will still be processed.
        console.error(`❌ Error processing user ${user.email}:`, userError);

        results.push({
          userId: user.id,
          email: user.email,
          status: "error",
          error:
            userError instanceof Error ? userError.message : "Unknown error",
        });
      }
    }

    // ---------------------------------------------------------------
    // STEP 5 — Aggregate & return the final report.
    // ---------------------------------------------------------------
    const successCount = results.filter((r) => r.status === "success").length;
    const failureCount = results.filter((r) => r.status === "error").length;
    const skippedCount = results.filter((r) => r.status === "skipped").length;

    return {
      success: true,
      totalUsers: users.length,
      successCount,
      failureCount,
      skippedCount,
      message: `Daily news sent to ${successCount} users`,
      details: results,
    };
  },
);

/**
 * Generate fallback summary if AI fails
 */
function generateFallbackSummary(articles: MarketNewsArticle[]): string {
  const topHeadlines = articles
    .slice(0, 3)
    .map((a) => `• ${a.headline}`)
    .join("\n");

  return `Here's your daily market update! Today's top stories include:\n\n${topHeadlines}\n\nCheck PepTickr for full details and stay ahead of the market!`;
}

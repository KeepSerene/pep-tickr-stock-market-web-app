import nodemailer from "nodemailer";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
} from "./templates";
import { getFormattedTodayDate } from "@/lib/utils";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function sendWelcomeEmail({
  email,
  name,
  intro,
}: WelcomeEmailData) {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const mailOptions = {
    from: '"PepTickr Team" <no-reply@peptickr.app>',
    to: email,
    subject: "Welcome to PepTickr — Your stock market toolkit is ready!",
    text: "Thanks for joining PepTickr.",
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      `Failed to send welcome email to ${email} via nodemailer:`,
      error,
    );
  }
}

interface DailyNewsEmailData {
  email: string;
  name: string;
  summary: string;
}

export async function sendDailyNewsEmail({
  email,
  name,
  summary,
}: DailyNewsEmailData) {
  const todayDate = getFormattedTodayDate();
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    todayDate,
  ).replace("{{newsContent}}", summary);
  const mailOptions = {
    from: '"PepTickr Team" <no-reply@peptickr.app>',
    to: email,
    subject: `📊 Your Daily Market Summary - ${todayDate}`,
    // Plain text fallback for email clients that don't render HTML
    text: `Hi ${name}, here's your personalized market news summary for ${todayDate}. Open the email to see your full daily briefing or visit your dashboard.`,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      `Failed to send daily news email to ${email} via nodemailer:`,
      error,
    );

    // Re-throw so the calling function in functions.ts knows this specific user failed
    throw error;
  }
}

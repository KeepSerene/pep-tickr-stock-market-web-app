import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timestamp: number) {
  const now = Date.now();
  const diffInMs = now - timestamp * 1000;

  if (diffInMs < 0) return "Just now";

  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInHours > 24) {
    const days = Math.floor(diffInHours / 24);

    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Formatted strings like: "₹1,500.00Cr", "₹25.00Cr", "₹5.50L" or "₹99,999.99"
export function formatMarketCapValue(marketCapInr: number): string {
  if (!Number.isFinite(marketCapInr) || marketCapInr <= 0) return "N/A";

  if (marketCapInr >= 1e7) return `₹${(marketCapInr / 1e7).toFixed(2)}Cr`; // Crores (10^7)
  if (marketCapInr >= 1e5) return `₹${(marketCapInr / 1e5).toFixed(2)}L`; // Lakhs (10^5)

  // Below one lakh, show full INR amount
  return `₹${marketCapInr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const formatISODate = (date: Date, timeZone = "Asia/Kolkata") =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const getDateRange = (days: number) => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);

  return {
    to: formatISODate(toDate),
    from: formatISODate(fromDate),
  };
};

// Get today's date range (from today to today)
export function getTodayDateRange() {
  const today = new Date();
  const todayString = formatISODate(today);

  return {
    to: todayString,
    from: todayString,
  };
}

// Calculate news per symbol based on watchlist size
export function calculateNewsDistribution(symbolsCount: number) {
  let itemsPerSymbol: number;
  let targetNewsCount = 6;

  if (symbolsCount < 3) {
    itemsPerSymbol = 3; // Fewer symbols, more news each
  } else if (symbolsCount === 3) {
    itemsPerSymbol = 2; // Exactly 3 symbols, 2 news each = 6 total
  } else {
    itemsPerSymbol = 1; // Many symbols, 1 news each
    targetNewsCount = 6; // Don't exceed 6 total
  }

  return { itemsPerSymbol, targetNewsCount };
}

// Check for required article fields
export const validateArticle = (article: RawNewsArticle) =>
  article.headline && article.summary && article.url && article.datetime;

// Get today's date string in YYYY-MM-DD format
export const getTodayString = () => formatISODate(new Date());

export const formatArticle = (
  article: RawNewsArticle,
  isCompanyNews: boolean,
  symbol?: string,
  index: number = 0,
) => ({
  id: isCompanyNews ? Date.now() + Math.random() : article.id + index,
  headline: article.headline!.trim(),
  summary:
    article.summary!.trim().substring(0, isCompanyNews ? 200 : 150) + "...",
  source: article.source || (isCompanyNews ? "Company News" : "Market News"),
  url: article.url!,
  datetime: article.datetime!,
  image: article.image || "",
  category: isCompanyNews ? "company" : article.category || "general",
  related: isCompanyNews ? symbol! : article.related || "",
});

export function formatChangePercent(changePercent?: number) {
  if (changePercent === undefined || changePercent === null) return "";

  const sign = changePercent > 0 ? "+" : "";

  return `${sign}${changePercent.toFixed(2)}%`;
}

export function getChangeColorClass(changePercent?: number) {
  if (!changePercent) return "text-gray-400";

  return changePercent > 0 ? "text-green-500" : "text-red-500";
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(price);
}

export function getAlertText(alert: Alert) {
  const condition = alert.alertType === "upper" ? ">" : "<";

  return `Price ${condition} ${formatPrice(alert.threshold)}`;
}

export const getFormattedTodayDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

/**
 * Generate fallback daily news summary if AI fails
 */
export function generateFallbackNewsSummary(
  articles: MarketNewsArticle[],
): string {
  const topHeadlines = articles
    .slice(0, 3)
    .map((a) => `• ${a.headline}`)
    .join("\n");

  return `<p class="mobile-text" style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4b5563;">Here's your daily market update! Today's top stories include:\n\n${topHeadlines}\n\nCheck PepTickr for full details and stay ahead of the market!</p>`;
}

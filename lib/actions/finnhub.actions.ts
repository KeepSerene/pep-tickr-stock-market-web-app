"use server";

import { formatArticle, getDateRange, validateArticle } from "@/lib/utils";

// Finnhub API configuration
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

/**
 * Generic fetch wrapper with Next.js caching support
 * @param url - Full URL to fetch
 * @param revalidateSeconds - Optional cache revalidation time
 * @returns Parsed JSON response
 */
async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number,
): Promise<T> {
  // Configure fetch options based on caching requirements
  const fetchOptions: RequestInit = revalidateSeconds
    ? {
        cache: "force-cache",
        next: { revalidate: revalidateSeconds },
      }
    : {
        cache: "no-store", // Always fetch fresh data if no revalidate specified
      };

  const response = await fetch(url, fetchOptions);

  // Handle non-200 responses
  if (!response.ok) {
    throw new Error(
      `Finnhub API error: ${response.status} - ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch news articles for specific symbols or general market news
 * @param symbols - Optional array of stock symbols (e.g., ["AAPL", "TSLA"])
 * @returns Array of formatted news articles (max 6)
 */
export async function getNews(
  symbols?: string[],
): Promise<MarketNewsArticle[]> {
  try {
    // Validate API key
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB_API_KEY is not configured");
    }

    // Get date range for last 5 days
    const { from, to } = getDateRange(5);

    // Case 1: User has watchlist symbols - fetch company-specific news
    if (symbols && symbols.length > 0) {
      return await fetchCompanyNews(symbols, from, to);
    }

    // Case 2: No symbols - fetch general market news
    return await fetchGeneralMarketNews(from, to);
  } catch (error) {
    console.error("Error in getNews:", error);
    throw new Error("Failed to fetch news");
  }
}

/**
 * Fetch company-specific news using round-robin strategy
 * This ensures balanced news distribution across all watchlist stocks
 */
async function fetchCompanyNews(
  symbols: string[],
  from: string,
  to: string,
): Promise<MarketNewsArticle[]> {
  // Clean and uppercase all symbols
  const cleanSymbols = symbols
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (cleanSymbols.length === 0) {
    return fetchGeneralMarketNews(from, to);
  }

  const allArticles: MarketNewsArticle[] = [];
  const maxRounds = 6; // Maximum iterations to prevent infinite loops
  let currentRound = 0;

  // Round-robin: cycle through symbols collecting one article per round
  while (allArticles.length < 6 && currentRound < maxRounds) {
    for (const symbol of cleanSymbols) {
      // Stop if we already have 6 articles
      if (allArticles.length >= 6) break;

      try {
        // Fetch company news from Finnhub
        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
        const news = await fetchJSON<RawNewsArticle[]>(url);

        // Find the first valid article we haven't used yet
        const validArticle = news.find(
          (article) =>
            validateArticle(article) &&
            !allArticles.some((a) => a.id === article.id), // Prevent duplicates
        );

        // Add article if found
        if (validArticle) {
          const formatted = formatArticle(
            validArticle,
            true, // isCompanyNews = true
            symbol,
            allArticles.length,
          );
          allArticles.push(formatted);
        }
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        // Continue to next symbol on error (graceful failure)
        continue;
      }
    }

    currentRound++;
  }

  // If we couldn't get enough company news, supplement with general news
  if (allArticles.length < 6) {
    try {
      const generalNews = await fetchGeneralMarketNews(from, to);
      const needed = 6 - allArticles.length;
      allArticles.push(...generalNews.slice(0, needed));
    } catch (error) {
      console.error("Error fetching supplemental general news:", error);
    }
  }

  // Sort by datetime (most recent first) and return
  return allArticles.sort((a, b) => b.datetime - a.datetime).slice(0, 6); // Ensure max 6 articles
}

/**
 * Fetch general market news (when user has no watchlist)
 */
async function fetchGeneralMarketNews(
  from: string,
  to: string,
): Promise<MarketNewsArticle[]> {
  try {
    // Fetch general market news from Finnhub
    const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
    const news = await fetchJSON<RawNewsArticle[]>(url);

    // Deduplicate by id, url, and headline
    const seenIds = new Set<number>();
    const seenUrls = new Set<string>();
    const seenHeadlines = new Set<string>();

    const uniqueArticles = news.filter((article) => {
      // Skip invalid articles
      if (!validateArticle(article)) return false;

      // Check for duplicates
      if (
        seenIds.has(article.id) ||
        seenUrls.has(article.url!) ||
        seenHeadlines.has(article.headline!)
      ) {
        return false;
      }

      // Mark as seen
      seenIds.add(article.id);
      seenUrls.add(article.url!);
      seenHeadlines.add(article.headline!);

      return true;
    });

    // Format and return top 6 articles
    return uniqueArticles
      .slice(0, 6)
      .map((article, index) => formatArticle(article, false, undefined, index));
  } catch (error) {
    console.error("Error fetching general market news:", error);
    throw error;
  }
}

/**
 * Search for stocks by query string
 * @param query - Search query (e.g., "Apple", "AAPL")
 * @returns Array of matching stocks
 */
export async function searchStocks(
  query: string,
): Promise<FinnhubSearchResult[]> {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB_API_KEY is not configured");
    }

    if (!query || query.trim().length < 1) {
      return [];
    }

    const cleanQuery = query.trim();
    const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(cleanQuery)}&token=${FINNHUB_API_KEY}`;

    const response = await fetchJSON<FinnhubSearchResponse>(url);

    // Return only US stocks and common stock types
    return (
      response.result?.filter(
        (stock) =>
          stock.type === "Common Stock" ||
          stock.type === "ETP" ||
          stock.type === "ETF",
      ) || []
    );
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}

/**
 * Fetch stock quote data (current price, change, etc.)
 * @param symbol - Stock symbol (e.g., "AAPL")
 * @returns Quote data including current price and percent change
 */
export async function getStockQuote(symbol: string): Promise<QuoteData | null> {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB_API_KEY is not configured");
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`;

    // Cache quote data for 60 seconds
    const quote = await fetchJSON<QuoteData>(url, 60);

    return quote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch company profile data
 * @param symbol - Stock symbol (e.g., "AAPL")
 * @returns Profile data including company name and market cap
 */
export async function getCompanyProfile(
  symbol: string,
): Promise<ProfileData | null> {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB_API_KEY is not configured");
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`;

    // Cache profile data for 1 hour (3600 seconds)
    const profile = await fetchJSON<ProfileData>(url, 3600);

    return profile;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    return null;
  }
}

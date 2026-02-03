"use server";

import connectToDatabase from "@/db/mongoose";
import Watchlist from "@/db/models/watchlist.model";

/**
 * Get all watchlist symbols for a user by their email
 * @param email - User's email address
 * @returns Array of stock symbols (e.g., ["AAPL", "TSLA", "GOOGL"])
 */
export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  // Early validation
  if (!email || typeof email !== "string") {
    console.error("Invalid email provided to getWatchlistSymbolsByEmail");

    return [];
  }

  try {
    const mongooseInstance = await connectToDatabase();
    const db = mongooseInstance?.connection?.db;

    if (!db) {
      throw new Error("MongoDB connection not found!");
    }

    // Find user by email in Better Auth's user collection
    const user = await db
      .collection("user")
      .findOne({ email }, { projection: { _id: 1, id: 1 } });

    if (!user) {
      console.warn(`No user found with email: ${email}`);

      return [];
    }

    const userId = user.id || user._id.toString();

    // Query watchlist for this user's symbols
    const watchlistItems = await Watchlist.find(
      { userId },
      { symbol: 1, _id: 0 }, // Only return symbol field
    )
      .sort({ addedAt: -1 }) // Most recently added first
      .lean(); // Return plain JS objects (faster)

    // Extract and return just the symbols as strings
    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error("Error fetching watchlist symbols by email:", error);

    return [];
  }
}

/**
 * Add a stock to user's watchlist
 * @param userId - User's ID from Better Auth
 * @param symbol - Stock symbol (e.g., "AAPL")
 * @param company - Company name (e.g., "Apple Inc.")
 * @returns Success status and message
 */
export async function addToWatchlist(
  userId: string,
  symbol: string,
  company: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDatabase();

    // Uppercase and trim symbol to ensure consistency
    const cleanSymbol = symbol.trim().toUpperCase();
    const cleanCompany = company.trim();

    // Validation
    if (!userId || !cleanSymbol || !cleanCompany) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Create new watchlist item
    // MongoDB unique index will prevent duplicates automatically
    await Watchlist.create({
      userId,
      symbol: cleanSymbol,
      company: cleanCompany,
    });

    return { success: true };
  } catch (error) {
    // Handle duplicate key error (E11000)
    if (error instanceof Error && error.message.includes("E11000")) {
      return {
        success: false,
        message: "Stock already in watchlist",
      };
    }

    console.error("Error adding to watchlist:", error);
    return {
      success: false,
      message: "Failed to add to watchlist",
    };
  }
}

/**
 * Remove a stock from user's watchlist
 * @param userId - User's ID from Better Auth
 * @param symbol - Stock symbol to remove
 * @returns Success status and message
 */
export async function removeFromWatchlist(
  userId: string,
  symbol: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDatabase();

    const cleanSymbol = symbol.trim().toUpperCase();

    if (!userId || !cleanSymbol) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Delete the watchlist item
    const result = await Watchlist.deleteOne({
      userId,
      symbol: cleanSymbol,
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Stock not found in watchlist",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return {
      success: false,
      message: "Failed to remove from watchlist",
    };
  }
}

/**
 * Check if a stock is in user's watchlist
 * @param userId - User's ID from Better Auth
 * @param symbol - Stock symbol to check
 * @returns Boolean indicating if stock is in watchlist
 */
export async function isInWatchlist(
  userId: string,
  symbol: string,
): Promise<boolean> {
  try {
    await connectToDatabase();

    const cleanSymbol = symbol.trim().toUpperCase();

    if (!userId || !cleanSymbol) {
      return false;
    }

    const exists = await Watchlist.exists({
      userId,
      symbol: cleanSymbol,
    });

    return !!exists;
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
}

/**
 * Get full watchlist for a user with all details
 * @param userId - User's ID from Better Auth
 * @returns Array of watchlist items with full details
 */
export async function getWatchlistByUserId(userId: string) {
  try {
    await connectToDatabase();

    if (!userId) {
      return [];
    }

    const watchlist = await Watchlist.find({ userId })
      .sort({ addedAt: -1 }) // Most recent first
      .lean();

    return watchlist.map((item) => ({
      userId: item.userId,
      symbol: item.symbol,
      company: item.company,
      addedAt: item.addedAt,
    }));
  } catch (error) {
    console.error("Error fetching watchlist by user ID:", error);
    return [];
  }
}

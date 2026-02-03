import { type Document, type Model, model, models, Schema } from "mongoose";

export interface WatchlistItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>(
  {
    // User ID from Better Auth (referenced from user collection)
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    // Stock symbol (e.g., "AAPL", "TSLA")
    symbol: {
      type: String,
      required: [true, "Stock symbol is required"],
      uppercase: true,
      trim: true,
      maxlength: [10, "Symbol cannot exceed 10 characters"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: prevents duplicate symbol per user
// This ensures each user can only add a specific stock once
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

// Additional index for efficient queries
WatchlistSchema.index({ addedAt: -1 }); // For sorting by recently added

// Export the model using Next.js hot-reload-safe pattern
// This prevents "OverwriteModelError" during development
const Watchlist: Model<WatchlistItem> =
  models?.Watchlist || model<WatchlistItem>("Watchlist", WatchlistSchema);

export default Watchlist;

import mongoose, { type ConnectOptions } from "mongoose";

const MONGO_DB_URI = process.env.MONGO_DB_URI;

// Extend TypeScript's global namespace
// This adds type safety for our cache on Node.js's global object
declare global {
  var mongooseCache: {
    mongooseInstance: typeof mongoose | null;
    mongoosePromise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  // First time running: create the cache structure on Node.js's global object
  cached = global.mongooseCache = {
    mongooseInstance: null,
    mongoosePromise: null,
  };
}

const mongoClientOptions: ConnectOptions = {
  dbName: "pep-tickr-db",
  appName: "PepTickr",
  bufferCommands: false,
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export default async function connectToDatabase() {
  if (!MONGO_DB_URI) {
    throw new Error("MONGO_DB_URI is missing in environment variables!");
  }

  if (cached.mongooseInstance) return cached.mongooseInstance;

  if (!cached.mongoosePromise) {
    cached.mongoosePromise = mongoose.connect(MONGO_DB_URI, mongoClientOptions);
  }

  try {
    cached.mongooseInstance = await cached.mongoosePromise;
    console.log(
      "Connected to MongoDB",
      cached.mongooseInstance.connection.host,
    );

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose disconnected!");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });
  } catch (error) {
    // If connection fails, clear the promise so next call can retry
    cached.mongoosePromise = null;

    if (error instanceof Error) throw error;

    console.error("Error connecting to MongoDB:", error);
  }
}

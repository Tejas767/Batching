/**
 * mongodb.js — Database connection utility.
 *
 * Uses a global cached connection to avoid creating a new connection
 * on every hot-reload in development (Next.js edge case).
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI is not set in environment variables.");
}

// Global cache to reuse connection across hot-reloads in dev
let cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "batching_system",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

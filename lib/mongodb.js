// ABOUTME: Mongoose connection helper, cached across hot reloads / serverless invocations.
// ABOUTME: Falls back to an in-memory MongoDB for local dev when MONGODB_URI isn't set.
import mongoose from "mongoose";

let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

async function resolveUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI is not set. Add it to your environment before deploying.");
  }

  // Local dev fallback: spin up an in-memory MongoDB so there's nothing to
  // configure to start hacking. Data does not persist across restarts.
  if (!global.__memoryMongo) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    global.__memoryMongo = await MongoMemoryServer.create();
    console.log("[mongodb] MONGODB_URI not set — using an in-memory MongoDB for local dev.");
  }
  return global.__memoryMongo.getUri();
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // If this attempt fails, clear the promise so the next call retries
    // instead of forever re-awaiting the same rejected promise — a warm
    // serverless container would otherwise stay poisoned by one bad attempt.
    cached.promise = resolveUri()
      .then((uri) => mongoose.connect(uri, { bufferCommands: false }))
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

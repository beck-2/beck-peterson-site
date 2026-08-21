// ABOUTME: One document per admin login attempt — used only to rate-limit by IP.
// ABOUTME: Never stores the password itself, just when and from where an attempt was made.
import mongoose from "mongoose";

const AdminLoginAttemptSchema = new mongoose.Schema(
  { ip: { type: String, required: true } },
  { timestamps: true }
);

// Rate limiting reads recent docs by ip; this keeps that query fast.
AdminLoginAttemptSchema.index({ ip: 1, createdAt: 1 });
// Attempts are only ever useful within the rate-limit window — self-cleans
// after a day so this collection doesn't grow forever.
AdminLoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export default mongoose.models.AdminLoginAttempt ||
  mongoose.model("AdminLoginAttempt", AdminLoginAttemptSchema);

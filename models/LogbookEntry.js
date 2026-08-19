// ABOUTME: One document per visitor logbook entry — a short message and/or a small drawing.
// ABOUTME: Visible to everyone; only an authenticated admin session can delete one.
import mongoose from "mongoose";

const LogbookEntrySchema = new mongoose.Schema(
  {
    name: { type: String, default: "", maxlength: 40 },
    message: { type: String, default: "", maxlength: 280 },
    // A small PNG data URL from the drawing pad, or empty if the visitor
    // only left a message. Validated server-side before saving.
    drawingDataUrl: { type: String, default: "" },
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

// Rate limiting reads recent docs by ip; this keeps that query fast.
LogbookEntrySchema.index({ ip: 1, createdAt: 1 });

export default mongoose.models.LogbookEntry ||
  mongoose.model("LogbookEntry", LogbookEntrySchema);

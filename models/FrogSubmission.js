// ABOUTME: One document per visitor session for the "frogs held" stat.
// ABOUTME: Upserted by sessionId, so a returning session edits its own value rather than adding a new one.
import mongoose from "mongoose";

const FrogSubmissionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    value: { type: Number, required: true, min: 0, max: 1000 },
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

// Rate limiting reads recent docs by ip; this keeps that query fast.
FrogSubmissionSchema.index({ ip: 1, createdAt: 1 });

export default mongoose.models.FrogSubmission ||
  mongoose.model("FrogSubmission", FrogSubmissionSchema);

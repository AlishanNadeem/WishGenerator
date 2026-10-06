import { Schema, model, models, type Model } from "mongoose";
import { MAX_NAME_LENGTH, MAX_WISH_LENGTH } from "@/types/wish";

export interface WishDocument {
  name: string;
  wish: string;
  flagged: boolean;
  createdAt: Date;
}

const wishSchema = new Schema<WishDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: MAX_NAME_LENGTH },
    wish: { type: String, required: true, trim: true, maxlength: MAX_WISH_LENGTH },
    flagged: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Supports efficient sorted pagination (find().sort({ createdAt: -1 }).skip().limit())
// at large collection sizes.
wishSchema.index({ createdAt: -1 });

export const WishModel = (models.Wish as Model<WishDocument>) || model("Wish", wishSchema);

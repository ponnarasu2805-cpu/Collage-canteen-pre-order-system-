import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  emoji: { type: String, default: "🍽️" },
  available: { type: Boolean, default: true },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("MenuItem", menuItemSchema);

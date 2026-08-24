import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: String,
  price: Number,
  quantity: { type: Number, min: 1, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  pickupTime: { type: String, default: "ASAP" },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Ready", "Completed", "Cancelled"],
    default: "Pending"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);

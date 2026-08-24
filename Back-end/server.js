import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  emoji: String,
  color: String,
  available: { type: Boolean, default: true }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "admin"], default: "student" }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{
    menuId: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  pickupTime: String,
  token: String,
  status: {
    type: String,
    enum: ["Placed", "Confirmed", "Preparing", "Ready", "Collected", "Cancelled"],
    default: "Placed"
  }
}, { timestamps: true });

const Menu = mongoose.model("Menu", menuSchema);
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Login required" });
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}

const seedMenu = [
  { name: "Veg Burger", category: "Fast Food", price: 70, description: "Crispy veg patty with fresh vegetables.", emoji: "🍔", color: "#ff8a65" },
  { name: "Pizza", category: "Fast Food", price: 120, description: "Cheesy campus-style pizza.", emoji: "🍕", color: "#ffd54f" },
  { name: "Masala Dosa", category: "South Indian", price: 65, description: "Crispy dosa with masala filling.", emoji: "🥞", color: "#ffcc80" },
  { name: "Veg Noodles", category: "Main Course", price: 90, description: "Hot noodles with vegetables.", emoji: "🍜", color: "#81d4fa" },
  { name: "Samosa", category: "Snacks", price: 25, description: "Crispy potato samosa.", emoji: "🥟", color: "#ffb74d" },
  { name: "Fresh Juice", category: "Drinks", price: 45, description: "Fresh seasonal fruit juice.", emoji: "🧃", color: "#a5d6a7" }
];

app.get("/api/health", (req, res) => res.json({ ok: true, message: "Smart Canteen API running" }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hash });
    res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/menu", async (req, res) => {
  const items = await Menu.find().sort({ category: 1, name: 1 });
  res.json(items);
});

app.post("/api/menu/seed", auth, adminOnly, async (req, res) => {
  await Menu.deleteMany({});
  const items = await Menu.insertMany(seedMenu);
  res.json(items);
});

app.post("/api/menu", auth, adminOnly, async (req, res) => {
  const item = await Menu.create(req.body);
  res.status(201).json(item);
});

app.patch("/api/menu/:id", auth, adminOnly, async (req, res) => {
  const item = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

app.post("/api/orders", auth, async (req, res) => {
  try {
    const { items, pickupTime } = req.body;
    if (!items?.length || !pickupTime) return res.status(400).json({ message: "Items and pickup time are required" });

    const ids = items.map(i => i.menuId);
    const menu = await Menu.find({ _id: { $in: ids }, available: true });
    if (menu.length !== ids.length) return res.status(400).json({ message: "One or more food items are unavailable" });

    const normalized = items.map(i => {
      const m = menu.find(x => x._id.toString() === i.menuId);
      return { menuId: m._id, name: m.name, price: m.price, quantity: Math.max(1, Number(i.quantity)) };
    });

    const total = normalized.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const token = "C" + Math.floor(100 + Math.random() * 900);

    const order = await Order.create({
      user: req.user.id, items: normalized, total, pickupTime, token
    });

    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/orders/my", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

app.get("/api/orders", auth, adminOnly, async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

app.patch("/api/orders/:id/status", auth, adminOnly, async (req, res) => {
  const allowed = ["Placed", "Confirmed", "Preparing", "Ready", "Collected", "Cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

app.get("/api/analytics", auth, adminOnly, async (req, res) => {
  const orders = await Order.find();
  const active = orders.filter(o => o.status !== "Cancelled");
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const itemCounts = {};
  active.forEach(o => o.items.forEach(i => {
    itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
  }));
  const popular = Object.entries(itemCounts).sort((a,b) => b[1]-a[1]).slice(0, 5);
  res.json({ totalOrders: active.length, revenue, pending: active.filter(o => !["Collected"].includes(o.status)).length, popular });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_canteen");
    console.log("MongoDB connected");
    const count = await Menu.countDocuments();
    if (!count) await Menu.insertMany(seedMenu);
    app.listen(process.env.PORT || 5000, () => console.log("API running on port 5000"));
  } catch (e) {
    console.error("Database connection failed:", e.message);
    process.exit(1);
  }
}

start();

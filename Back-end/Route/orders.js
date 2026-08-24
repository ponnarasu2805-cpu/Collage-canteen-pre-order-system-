import { Router } from "express";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, async (req, res) => {
  try {
    const { items, pickupTime } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Cart is empty" });

    const ids = items.map(i => i.menuItem);
    const menu = await MenuItem.find({ _id: { $in: ids }, available: true });
    const map = new Map(menu.map(i => [i._id.toString(), i]));

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = map.get(item.menuItem);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid menu item or quantity" });
      }
      orderItems.push({
        menuItem: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
      total += product.price * quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      pickupTime: pickupTime || "ASAP"
    });

    res.status(201).json(await order.populate("items.menuItem"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user.id };
    const orders = await Order.find(query).populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const allowed = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate("user", "name email");
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

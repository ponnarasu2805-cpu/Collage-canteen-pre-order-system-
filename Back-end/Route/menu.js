import { Router } from "express";
import MenuItem from "../models/MenuItem.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
    res.json(await MenuItem.find(filter).sort({ popular: -1, name: 1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id", auth, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

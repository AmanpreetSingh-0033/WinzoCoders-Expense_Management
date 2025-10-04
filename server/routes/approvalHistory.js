import express from "express";
import ApprovalHistory from "../models/ApprovalHistory.js";
const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    const history = await ApprovalHistory.create(req.body);
    res.status(201).json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  try {
    const histories = await ApprovalHistory.find().populate("expense approver");
    res.json(histories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get("/:id", async (req, res) => {
  try {
    const history = await ApprovalHistory.findById(req.params.id).populate(
      "expense approver"
    );
    if (!history) return res.status(404).json({ error: "Not found" });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const history = await ApprovalHistory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!history) return res.status(404).json({ error: "Not found" });
    res.json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const history = await ApprovalHistory.findByIdAndDelete(req.params.id);
    if (!history) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

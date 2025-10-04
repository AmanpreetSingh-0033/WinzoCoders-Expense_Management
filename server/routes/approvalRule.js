import express from "express";
import ApprovalRule from "../models/ApprovalRule.js";
const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    // Map frontend field names to model field names
    const ruleData = {
      company: req.body.company_id,
      name: req.body.name,
      amountThreshold: req.body.amount_threshold,
      percentageThreshold: req.body.percentage_threshold,
      specificApprovers: req.body.specific_approver_ids,
      sequence: req.body.sequence?.map((item, index) => ({
        approver: item.user_id,
        order: index + 1,
      })),
      isHybrid: req.body.is_hybrid,
      isActive: req.body.is_active,
      appliesToCategories: req.body.applies_to_categories,
    };

    const rule = await ApprovalRule.create(ruleData);
    res.status(201).json(rule);
  } catch (err) {
    console.error("Approval rule creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  try {
    const rules = await ApprovalRule.find().populate(
      "company sequence.approver specificApprovers"
    );
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get("/:id", async (req, res) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id).populate(
      "company sequence.approver specificApprovers"
    );
    if (!rule) return res.status(404).json({ error: "Not found" });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    // Map frontend field names to model field names
    const updateData = {
      company: req.body.company_id,
      name: req.body.name,
      amountThreshold: req.body.amount_threshold,
      percentageThreshold: req.body.percentage_threshold,
      specificApprovers: req.body.specific_approver_ids,
      sequence: req.body.sequence?.map((item, index) => ({
        approver: item.user_id,
        order: index + 1,
      })),
      isHybrid: req.body.is_hybrid,
      isActive: req.body.is_active,
      appliesToCategories: req.body.applies_to_categories,
    };

    const rule = await ApprovalRule.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );
    if (!rule) return res.status(404).json({ error: "Not found" });
    res.json(rule);
  } catch (err) {
    console.error("Approval rule update error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const rule = await ApprovalRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

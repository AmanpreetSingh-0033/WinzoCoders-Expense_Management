import express from "express";
import User from "../models/User.js";
const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    // Map frontend field names to model field names
    const userData = {
      authId: req.body.email, // Use email as authId for now
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role,
      company: req.body.company_id,
      manager: req.body.manager_id,
      isManagerApprover: req.body.is_manager_approver,
    };

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (err) {
    console.error("User creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("company").populate("manager");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("company")
      .populate("manager");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    // Map frontend field names to model field names
    const updateData = {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role,
      company: req.body.company_id,
      manager: req.body.manager_id,
      isManagerApprover: req.body.is_manager_approver,
    };

    // Only include password if it's provided
    if (req.body.password) {
      updateData.password = req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    console.error("User update error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

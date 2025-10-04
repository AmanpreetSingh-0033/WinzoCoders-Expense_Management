import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme_secret";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, companyName, country } = req.body;
    if (!name || !email || !password || !companyName || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }
    // Create company
    const company = await Company.create({
      name: companyName,
      country,
      currency: "INR", // Default, you can adjust
    });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = await User.create({
      name,
      email,
      authId: email, // for now, use email as unique id
      password: hashedPassword,
      company: company._id,
      role: "admin", // first user is admin
    });
    res.status(201).json({ message: "User created", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("company");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

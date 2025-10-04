
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import companyRoutes from "./routes/company.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expense.js";
import approvalRuleRoutes from "./routes/approvalRule.js";
import approvalHistoryRoutes from "./routes/approvalHistory.js";
import authRoutes from "./routes/auth.js";

const app = express();

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://arana052005_db_user:LQS3Bkymxf6fTrn9@cluster0.egj3pws.mongodb.net/efgh?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/approval-rules", approvalRuleRoutes);
app.use("/api/approval-history", approvalHistoryRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { signup, login } from "./routes/auth";
import { requireAuth, requireRole } from "./middleware/auth";
import { listExpenses, createExpense, decide, listCountries, getRatesHandler, adminOverride } from "./routes/expenses";
import { listUsers, getUser, createUserHandler, updateUserHandler, deleteUserHandler, getCurrentUser } from "./routes/users";
import { getWorkflowRules, updateWorkflowRules } from "./routes/workflows";
import { upload } from "./utils/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.get("/api/me", requireAuth, getCurrentUser);

  // Reference APIs
  app.get("/api/countries", listCountries);
  app.get("/api/rates/:base", getRatesHandler);

  // Users (Admin only)
  app.get("/api/users", requireAuth, requireRole(["ADMIN", "FINANCE", "DIRECTOR", "CFO"]), listUsers);
  app.get("/api/users/:id", requireAuth, getUser);
  app.post("/api/users", requireAuth, requireRole(["ADMIN"]), createUserHandler);
  app.put("/api/users/:id", requireAuth, requireRole(["ADMIN"]), updateUserHandler);
  app.delete("/api/users/:id", requireAuth, requireRole(["ADMIN"]), deleteUserHandler);

  // Workflow rules (Admin only)
  app.get("/api/workflows", requireAuth, getWorkflowRules);
  app.put("/api/workflows", requireAuth, requireRole(["ADMIN"]), updateWorkflowRules);

  // Expenses
  app.get("/api/expenses", requireAuth, listExpenses);
  app.post("/api/expenses", requireAuth, upload.single("receipt"), createExpense);
  app.post("/api/expenses/:id/decision", requireAuth, decide);
  app.post("/api/expenses/:id/override", requireAuth, requireRole(["ADMIN"]), adminOverride);

  return app;
}

import { RequestHandler } from "express";
import { z } from "zod";
import { db, createUser } from "../store";
import { hashPassword } from "../utils/auth";
import type { Role } from "@shared/api";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR", "CFO"]),
  managerId: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR", "CFO"]).optional(),
  managerId: z.string().optional(),
});

export const listUsers: RequestHandler = (req, res) => {
  const user = (req as any).user as { companyId: string; role: string };
  
  // Only Admin, Finance, Director, and CFO can list all users
  if (!["ADMIN", "FINANCE", "DIRECTOR", "CFO"].includes(user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const users = Object.values(db.users)
    .filter((u) => u.companyId === user.companyId)
    .map(({ passwordHash, ...u }) => u);

  res.json(users);
};

export const getUser: RequestHandler = (req, res) => {
  const authUser = (req as any).user as { sub: string; companyId: string; role: string };
  const { id } = req.params;

  const user = db.users[id];
  if (!user || user.companyId !== authUser.companyId) {
    return res.status(404).json({ message: "User not found" });
  }

  // Users can view their own profile, or admins can view anyone
  if (authUser.sub !== id && !["ADMIN", "FINANCE", "DIRECTOR", "CFO"].includes(authUser.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { passwordHash, ...userData } = user;
  res.json(userData);
};

export const createUserHandler: RequestHandler = async (req, res) => {
  const authUser = (req as any).user as { companyId: string; role: string };

  // Only Admin can create users
  if (authUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admins can create users" });
  }

  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.errors });
  }

  const { name, email, password, role, managerId } = parsed.data;

  // Check if email already exists
  const existing = Object.values(db.users).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // Validate manager exists if provided
  if (managerId) {
    const manager = db.users[managerId];
    if (!manager || manager.companyId !== authUser.companyId) {
      return res.status(400).json({ message: "Invalid manager ID" });
    }
  }

  const passwordHash = hashPassword(password);
  const newUser = createUser({
    name,
    email,
    role: role as Role,
    companyId: authUser.companyId,
    passwordHash,
    managerId: managerId || null,
  });

  const { passwordHash: _, ...userData } = newUser;
  res.status(201).json(userData);
};

export const updateUserHandler: RequestHandler = (req, res) => {
  const authUser = (req as any).user as { companyId: string; role: string };
  const { id } = req.params;

  // Only Admin can update users
  if (authUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admins can update users" });
  }

  const user = db.users[id];
  if (!user || user.companyId !== authUser.companyId) {
    return res.status(404).json({ message: "User not found" });
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.errors });
  }

  const { name, role, managerId } = parsed.data;

  // Validate manager exists if provided
  if (managerId !== undefined) {
    if (managerId && managerId !== "") {
      const manager = db.users[managerId];
      if (!manager || manager.companyId !== authUser.companyId) {
        return res.status(400).json({ message: "Invalid manager ID" });
      }
    }
    user.managerId = managerId || null;
  }

  if (name) user.name = name;
  if (role) user.role = role as Role;

  const { passwordHash: _, ...userData } = user;
  res.json(userData);
};

export const deleteUserHandler: RequestHandler = (req, res) => {
  const authUser = (req as any).user as { companyId: string; role: string };
  const { id } = req.params;

  // Only Admin can delete users
  if (authUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admins can delete users" });
  }

  const user = db.users[id];
  if (!user || user.companyId !== authUser.companyId) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent deleting yourself
  if (authUser.companyId === id) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }

  delete db.users[id];
  res.json({ message: "User deleted successfully" });
};

export const getCurrentUser: RequestHandler = (req, res) => {
  const authUser = (req as any).user as { sub: string };
  const user = db.users[authUser.sub];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const company = db.companies[user.companyId];
  const { passwordHash, ...userData } = user;

  res.json({
    user: userData,
    company,
  });
};

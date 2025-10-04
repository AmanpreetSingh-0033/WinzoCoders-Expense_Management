import { RequestHandler } from "express";
import { verifyToken } from "../utils/auth";

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export function requireRole(roles: string[]): RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user as { role?: string } | undefined;
    if (!user || !user.role || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

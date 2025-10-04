import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { User } from "@shared/api";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SALT_ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hashed: string) {
  return bcrypt.compareSync(password, hashed);
}

export function signToken(user: User) {
  const payload = { sub: user.id, role: user.role, companyId: user.companyId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string; role: string; companyId: string };
}

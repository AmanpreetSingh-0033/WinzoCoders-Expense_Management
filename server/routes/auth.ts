import { RequestHandler } from "express";
import { z } from "zod";
import { AuthPayload, Company, SignupInput, LoginInput } from "@shared/api";
import { db, createCompany, createUser, seedDemo } from "../store";
import { hashPassword, signToken, verifyPassword } from "../utils/auth";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.string().min(1),
  companyName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function getCurrencyForCountry(country: string): Promise<string> {
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
    const data = (await res.json()) as any[];
    const match = data.find((c) => c?.name?.common?.toLowerCase() === country.toLowerCase());
    if (!match || !match.currencies) return "USD";
    const code = Object.keys(match.currencies)[0];
    return code || "USD";
  } catch {
    return "USD";
  }
}

export const signup: RequestHandler = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body as SignupInput);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const { name, email, password, country, companyName } = parsed.data;

  const existing = Object.values(db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const currency = await getCurrencyForCountry(country);
  const company: Company = createCompany(companyName, country, currency);
  const passwordHash = hashPassword(password);
  const admin = createUser({ name, email, role: "ADMIN", companyId: company.id, passwordHash });

  seedDemo(company, admin);

  const token = signToken(admin);
  const payload: AuthPayload = {
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      companyId: admin.companyId,
      managerId: admin.managerId,
    },
    company,
  };
  return res.status(201).json(payload);
};

export const login: RequestHandler = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body as LoginInput);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const { email, password } = parsed.data;
  const user = Object.values(db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (!verifyPassword(password, user.passwordHash)) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  const company = db.companies[user.companyId];
  const payload: AuthPayload = {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId, managerId: user.managerId },
    company,
  };
  return res.json(payload);
};

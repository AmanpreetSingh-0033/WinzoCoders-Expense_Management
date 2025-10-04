import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../store";
import { randomUUID } from "crypto";
import type { CreateExpenseInput, Expense, Approval, DecisionInput } from "@shared/api";

const createExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(4),
});

async function getRates(base: string): Promise<Record<string, number>> {
  try {
    const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`);
    const j = (await r.json()) as any;
    return j.rates || {};
  } catch {
    return {};
  }
}

export const listExpenses: RequestHandler = (req, res) => {
  const user = (req as any).user as { sub: string; role: string; companyId: string };
  const all = Object.values(db.expenses).filter((e) => e.companyId === user.companyId);
  let result: Expense[] = [];
  if (user.role === "ADMIN" || user.role === "FINANCE" || user.role === "DIRECTOR" || user.role === "CFO") {
    result = all;
  } else if (user.role === "MANAGER") {
    // manager sees expenses where they are in approver sequence or from their team
    result = all.filter((e) => e.approverSequence.includes(user.sub));
  } else {
    result = all.filter((e) => e.employeeId === user.sub);
  }
  res.json(result);
};

export const createExpense: RequestHandler = async (req, res) => {
  const user = (req as any).user as { sub: string; companyId: string };
  
  // Handle multipart form data
  const body = req.body;
  const file = (req as any).file as Express.Multer.File | undefined;
  
  const parsed = createExpenseSchema.safeParse({
    amount: Number(body.amount),
    currency: body.currency,
    category: body.category,
    description: body.description,
    date: body.date,
  });
  
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const input = parsed.data;

  const company = db.companies[user.companyId];
  let convertedAmount = input.amount;
  if (input.currency !== company.currency) {
    const rates = await getRates(input.currency);
    const rate = rates[company.currency];
    convertedAmount = rate ? input.amount * rate : input.amount;
  }

  // approver sequence: manager -> FINANCE -> DIRECTOR (if present in company users)
  const allUsers = Object.values(db.users).filter((u) => u.companyId === company.id);
  const managerId = db.users[user.sub]?.managerId || null;
  const finance = allUsers.find((u) => u.role === "FINANCE");
  const director = allUsers.find((u) => u.role === "DIRECTOR");
  const approverSequence = [managerId, finance?.id, director?.id].filter(Boolean) as string[];

  const id = randomUUID();
  const approvals: Approval[] = approverSequence.map((aId) => ({ expenseId: id, approverId: aId, decision: "PENDING" }));

  const expense: Expense = {
    id,
    employeeId: user.sub,
    companyId: user.companyId,
    amount: input.amount,
    currency: input.currency,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    convertedCurrency: company.currency,
    category: input.category,
    description: input.description,
    date: input.date,
    receiptUrl: file ? `/uploads/${file.filename}` : undefined,
    status: approverSequence.length ? "PENDING" : "APPROVED",
    approvals,
    approverSequence,
    currentApproverIndex: 0,
  };
  db.expenses[id] = expense;
  res.status(201).json(expense);
};

export const decide: RequestHandler = (req, res) => {
  const user = (req as any).user as { sub: string; role: string; companyId: string };
  const { id } = req.params as { id: string };
  const expense = db.expenses[id];
  if (!expense || expense.companyId !== user.companyId) return res.status(404).json({ message: "Not found" });

  const parsed = z.object({ decision: z.enum(["APPROVED", "REJECTED"]), comment: z.string().optional() }).safeParse(req.body as DecisionInput);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });

  // Check if current user is valid approver
  const idx = expense.currentApproverIndex;
  const approverId = expense.approverSequence[idx];
  if (approverId !== user.sub) return res.status(403).json({ message: "Not your turn to approve" });

  // Apply decision
  const appr = expense.approvals.find((a) => a.approverId === user.sub)!;
  appr.decision = parsed.data.decision;
  appr.comment = parsed.data.comment;
  appr.decidedAt = new Date().toISOString();

  // CFO override OR percentage rule
  const rules = db.companies[expense.companyId].rules;
  const approvals = expense.approvals.filter((a) => a.decision !== "PENDING");
  const approvedCount = approvals.filter((a) => a.decision === "APPROVED").length;
  const total = expense.approvals.length || 1;
  const ratio = approvedCount / total;

  const cfoApproved = approvals.some((a) => {
    const u = db.users[a.approverId];
    return a.decision === "APPROVED" && u?.role === "CFO";
  });

  if (parsed.data.decision === "REJECTED") {
    expense.status = "REJECTED";
  } else if (
    (rules.hybrid && (ratio >= (rules.percentage ?? 1) || (rules.cfoOverride && cfoApproved))) ||
    (!rules.hybrid && rules.cfoOverride && cfoApproved) ||
    (!rules.hybrid && !rules.cfoOverride && ratio >= (rules.percentage ?? 1))
  ) {
    expense.status = "APPROVED";
  } else {
    // Move to next approver if any
    if (expense.currentApproverIndex < expense.approverSequence.length - 1) {
      expense.currentApproverIndex += 1;
    }
    // If last approver decided and no rule met, keep pending awaiting rule satisfaction, or mark approved if all approved
    if (expense.currentApproverIndex === expense.approverSequence.length - 1) {
      if (ratio === 1) expense.status = "APPROVED";
    }
  }

  res.json(expense);
};

export const listCountries: RequestHandler = async (_req, res) => {
  try {
    const r = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
    const j = await r.json();
    res.json(j);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch countries" });
  }
};

export const getRatesHandler: RequestHandler = async (req, res) => {
  try {
    const base = req.params.base as string;
    const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`);
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch rates" });
  }
};

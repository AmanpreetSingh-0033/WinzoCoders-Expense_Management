import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../store";

const updateWorkflowSchema = z.object({
  percentage: z.number().min(0).max(1).optional(),
  cfoOverride: z.boolean().optional(),
  hybrid: z.boolean().optional(),
});

export const getWorkflowRules: RequestHandler = (req, res) => {
  const user = (req as any).user as { companyId: string; role: string };

  const company = db.companies[user.companyId];
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  res.json(company.rules);
};

export const updateWorkflowRules: RequestHandler = (req, res) => {
  const user = (req as any).user as { companyId: string; role: string };

  // Only Admin can update workflow rules
  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admins can update workflow rules" });
  }

  const company = db.companies[user.companyId];
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  const parsed = updateWorkflowSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.errors });
  }

  const { percentage, cfoOverride, hybrid } = parsed.data;

  if (percentage !== undefined) company.rules.percentage = percentage;
  if (cfoOverride !== undefined) company.rules.cfoOverride = cfoOverride;
  if (hybrid !== undefined) company.rules.hybrid = hybrid;

  res.json(company.rules);
};

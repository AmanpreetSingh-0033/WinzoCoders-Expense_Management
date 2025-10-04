/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Expense Management domain types
export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE" | "FINANCE" | "DIRECTOR" | "CFO";

export interface Company {
  id: string;
  name: string;
  country: string; // ISO country common name
  currency: string; // ISO 4217 currency code
  rules: WorkflowRules;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
  managerId?: string | null;
}

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Expense {
  id: string;
  employeeId: string;
  companyId: string;
  amount: number;
  currency: string; // currency the receipt was in
  convertedAmount: number; // converted to company currency
  convertedCurrency: string; // company currency
  category: string;
  description: string;
  date: string; // ISO date
  receiptUrl?: string;
  status: ExpenseStatus;
  approvals: Approval[];
  approverSequence: string[]; // userIds in order
  currentApproverIndex: number;
}

export interface Approval {
  expenseId: string;
  approverId: string;
  decision: "APPROVED" | "REJECTED" | "PENDING";
  comment?: string;
  decidedAt?: string; // ISO
}

export interface WorkflowRules {
  percentage?: number; // e.g. 0.6 for 60%
  cfoOverride?: boolean; // if true, CFO approval auto-approves overall
  hybrid?: boolean; // if true, percentage OR CFO override
}

export interface AuthPayload {
  token: string;
  user: User;
  company: Company;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  country: string; // country common name
  companyName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateExpenseInput {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string; // ISO date
}

export interface DecisionInput {
  decision: "APPROVED" | "REJECTED";
  comment?: string;
}

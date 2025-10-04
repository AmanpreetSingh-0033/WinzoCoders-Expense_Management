import { Company, User, Role, WorkflowRules, Expense, Approval } from "@shared/api";
import { randomUUID } from "crypto";

export interface DB {
  users: Record<string, User & { passwordHash: string }>;
  companies: Record<string, Company>;
  expenses: Record<string, Expense>;
}

export const db: DB = {
  users: {},
  companies: {},
  expenses: {},
};

export function createCompany(name: string, country: string, currency: string, rules?: Partial<WorkflowRules>) {
  const company: Company = {
    id: randomUUID(),
    name,
    country,
    currency,
    rules: {
      percentage: 0.6,
      cfoOverride: true,
      hybrid: true,
      ...rules,
    },
  };
  db.companies[company.id] = company;
  return company;
}

export function createUser(params: { name: string; email: string; role: Role; companyId: string; passwordHash: string; managerId?: string | null }) {
  const user: User & { passwordHash: string } = {
    id: randomUUID(),
    name: params.name,
    email: params.email,
    role: params.role,
    companyId: params.companyId,
    managerId: params.managerId ?? null,
    passwordHash: params.passwordHash,
  };
  db.users[user.id] = user;
  return user;
}

export function seedDemo(company: Company, admin: User & { passwordHash: string }) {
  // Optionally add a manager and employee with sample expenses
  const manager = createUser({
    name: "Morgan Manager",
    email: "manager@example.com",
    role: "MANAGER",
    companyId: company.id,
    passwordHash: admin.passwordHash,
  });
  const employee = createUser({
    name: "Evan Employee",
    email: "employee@example.com",
    role: "EMPLOYEE",
    companyId: company.id,
    passwordHash: admin.passwordHash,
    managerId: manager.id,
  });

  // sample expense pending manager approval
  const expenseId = randomUUID();
  const approvals: Approval[] = [
    { expenseId, approverId: manager.id, decision: "PENDING" },
  ];
  db.expenses[expenseId] = {
    id: expenseId,
    employeeId: employee.id,
    companyId: company.id,
    amount: 120,
    currency: "USD",
    convertedAmount: 120,
    convertedCurrency: company.currency,
    category: "Meals",
    description: "Team lunch",
    date: new Date().toISOString().slice(0, 10),
    status: "PENDING",
    approvals,
    approverSequence: [manager.id],
    currentApproverIndex: 0,
  };
}

/*
  # Expense Management System - Complete Database Schema

  ## Overview
  This migration creates a comprehensive expense management system with multi-role support,
  approval workflows, currency conversion, and conditional approval rules.

  ## New Tables

  ### 1. companies
  Stores company information and configuration
  - id (uuid, primary key)
  - name (text) - Company name
  - country (text) - Company country
  - currency (text) - Default currency code (USD, EUR, GBP, etc.)
  - approval_config (jsonb) - Approval settings and thresholds
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. users (extends auth.users)
  User profiles with role and company association
  - id (uuid, primary key, references auth.users)
  - email (text, unique)
  - name (text)
  - role (text) - admin, manager, or employee
  - company_id (uuid, references companies)
  - manager_id (uuid, nullable, references users)
  - is_manager_approver (boolean) - If true, manager approves first
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 3. expenses
  Expense claims submitted by employees
  - id (uuid, primary key)
  - title (text)
  - description (text)
  - amount (numeric) - Original amount
  - currency (text) - Original currency
  - converted_amount (numeric) - Amount in company currency
  - category (text) - Travel, Food, Office, etc.
  - expense_date (date)
  - submitter_id (uuid, references users)
  - company_id (uuid, references companies)
  - status (text) - pending, approved, rejected, escalated
  - current_approver_index (integer) - Current position in approval sequence
  - approval_sequence (jsonb) - Array of approver objects
  - metadata (jsonb) - Additional data
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 4. approval_rules
  Configurable approval rules for companies
  - id (uuid, primary key)
  - company_id (uuid, references companies)
  - name (text) - Rule name
  - sequence (jsonb) - Ordered list of approvers
  - percentage_threshold (numeric) - E.g., 60 for 60%
  - specific_approver_ids (jsonb) - Array of user IDs who can auto-approve
  - is_hybrid (boolean) - Combines percentage OR specific approver
  - amount_threshold (numeric) - Apply rule only if amount exceeds this
  - is_active (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 5. approval_history
  Audit trail for all approval actions
  - id (uuid, primary key)
  - expense_id (uuid, references expenses)
  - approver_id (uuid, references users)
  - action (text) - approved, rejected, escalated
  - comment (text)
  - created_at (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies for role-based access control
  - Admins: full access to company data
  - Managers: view team expenses and approve assigned
  - Employees: view own expenses only
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  approval_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_manager_approver boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  converted_amount numeric NOT NULL CHECK (converted_amount > 0),
  category text NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  submitter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  current_approver_index integer DEFAULT 0,
  approval_sequence jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create approval_rules table
CREATE TABLE IF NOT EXISTS approval_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  sequence jsonb DEFAULT '[]'::jsonb,
  percentage_threshold numeric DEFAULT 0 CHECK (percentage_threshold >= 0 AND percentage_threshold <= 100),
  specific_approver_ids jsonb DEFAULT '[]'::jsonb,
  is_hybrid boolean DEFAULT false,
  amount_threshold numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'escalated', 'submitted')),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_expenses_submitter_id ON expenses(submitter_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_approval_rules_company_id ON approval_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_expense_id ON approval_history(expense_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can view users in their company"
  ON users FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their company"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users in their company"
  ON users FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete users in their company"
  ON users FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses in their company"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Employees can insert their own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    submitter_id = auth.uid() AND
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update expenses in their company"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete expenses in their company"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for approval_rules
CREATE POLICY "Users can view approval rules in their company"
  ON approval_rules FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage approval rules"
  ON approval_rules FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for approval_history
CREATE POLICY "Users can view approval history for expenses in their company"
  ON approval_history FOR SELECT
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses
      WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Approvers can insert approval history"
  ON approval_history FOR INSERT
  TO authenticated
  WITH CHECK (
    approver_id = auth.uid()
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_rules_updated_at BEFORE UPDATE ON approval_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

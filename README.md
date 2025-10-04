# ExpenseFlow - Complete Expense Management System

A full-stack expense management application built with React, Vite, and Supabase. Features include role-based access control, multi-level approval workflows, currency conversion, and conditional approval rules.

## Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with Supabase Auth
- **Role-Based Access Control**: Three roles (Admin, Manager, Employee) with different permissions
- **Expense Submission**: Employees can submit expenses with multiple currencies
- **Automatic Currency Conversion**: Real-time conversion to company default currency
- **Multi-Level Approval Workflows**: Sequential approval processes with customizable rules
- **Conditional Approval Rules**: Percentage-based, specific approver, and hybrid rules
- **Approval History**: Complete audit trail for all expense actions
- **Manager-First Approval**: Optional flag to require manager approval first

### User Roles

#### Admin
- Full system access
- Create/manage users
- Configure approval rules
- View all expenses
- Override approvals
- Update company settings

#### Manager
- View team expenses
- Approve/reject expenses in approval queue
- Submit own expenses
- View pending approvals

#### Employee
- Submit expense claims
- View own expense history
- Track expense status
- View approval history

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Supabase JS Client** - Backend integration

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication

### External Services
- **Exchange Rate API** - Free currency conversion (exchangerate-api.com)

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account (configured and ready)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with Supabase credentials:

```env
VITE_SUPABASE_URL=https://xyfdhbwevbnhldzhkntu.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Database Setup

Run the database migration SQL in your Supabase SQL Editor:

```sql
-- See the complete SQL schema in the migration that needs to be applied
-- Create tables: companies, users, expenses, approval_rules, approval_history
-- Enable Row Level Security on all tables
-- Create RLS policies for role-based access
```

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

## First Time Setup

### Sign Up Flow
1. Navigate to `/signup`
2. Enter your details:
   - Name
   - Email
   - Company Name
   - Country (this automatically sets the default currency)
   - Password
3. Click "Create Account"
4. You'll be logged in as an Admin and redirected to the dashboard

### Creating Users (Admin Only)
1. Go to "Manage Users" in the admin section
2. Click "Add User"
3. Fill in user details:
   - Name, Email, Password
   - Role (Admin, Manager, Employee)
   - Manager (optional - select from existing managers)
   - Check "Manager must approve first" if needed
4. Click "Create User"

### Configuring Approval Rules (Admin Only)
1. Go to "Approval Rules" in the admin section
2. Click "Add Rule"
3. Configure:
   - Rule name
   - Amount threshold (rule applies to expenses above this)
   - Percentage threshold (optional - auto-approve at X%)
   - Approval sequence (ordered list of approvers)
   - Hybrid rule (optional - OR logic for conditions)
4. Click "Create Rule"

## Usage Guide

### Submitting an Expense (Employee)
1. Go to "Submit Expense"
2. Fill in:
   - Title (e.g., "Client Dinner")
   - Description (optional)
   - Amount and Currency
   - Category
   - Date
3. Click "Submit Expense"
4. Expense enters approval workflow automatically

### Approving Expenses (Manager/Admin)
1. Go to "Approvals"
2. See list of expenses waiting for your approval
3. Click "Review" on an expense
4. View all details including:
   - Submitter information
   - Amount (converted to company currency)
   - Previous approvals (if any)
5. Add a comment (optional for approve, required for reject)
6. Click "Approve" or "Reject"

### Tracking Expenses (Employee)
1. Go to "My Expenses"
2. Filter by status (All, Pending, Approved, Rejected)
3. Click "View" to see detailed information
4. See approval history and comments

## Approval Workflow Logic

### Sequential Approval
- Expenses move through approvers one by one
- Current approver must act before moving to next
- If rejected at any stage, workflow stops

### Manager-First Approval
- If employee has `is_manager_approver` enabled
- Their manager must approve first
- Then moves to configured approval sequence

### Conditional Rules

#### Percentage Rule
- Example: 60% threshold
- If 60% of approvers approve, expense auto-approves
- Remaining approvers don't need to act

#### Specific Approver Rule
- Example: CFO as specific approver
- If CFO approves, expense auto-approves
- Bypasses other approvers

#### Hybrid Rule
- Combines percentage AND specific approver
- Either condition triggers auto-approval
- Provides flexibility

## Security

### Row-Level Security (RLS)
All tables have RLS enabled with policies:

- **Companies**: Users can only view/edit their own company
- **Users**: Users can view users in their company; only admins can create/edit/delete
- **Expenses**: Users can view company expenses; only submitters can create
- **Approval Rules**: Company-scoped; only admins can manage
- **Approval History**: Read-only for company members

### Authentication
- JWT-based authentication via Supabase
- Secure password hashing
- Protected routes requiring authentication
- Role-based access control on routes and components

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

The application uses the following tables:

- **companies** - Company information and settings
- **users** - User profiles with roles and manager relationships
- **expenses** - Expense claims with approval tracking
- **approval_rules** - Configurable approval workflows
- **approval_history** - Complete audit trail of all actions

All tables are protected with Row Level Security policies to ensure data privacy and security.

## License

MIT

# Expense Flow - Modern Expense Management System

A production-ready full-stack expense management application with advanced role-based workflows, multi-level approvals, admin override capabilities, currency conversion, and receipt upload features.

## 🚀 Key Features

### 💼 Complete Expense Management
- **Multi-Level Approval Workflows**: Configurable approval chains (Manager → Finance → Director → CFO)
- **Admin Override**: Admins can instantly approve/reject any expense, bypassing workflows
- **Conditional Approval Rules**: Percentage-based, CFO override, and hybrid approval modes
- **Manager Approval Toggle**: Enable/disable manager approval requirement per company
- **Sequential Approval Flow**: Only current approver can make decisions
- **Audit Trail**: Complete logging of all approval decisions and overrides

### 🔐 Role-Based Access Control
Six distinct roles with specific permissions:
- **Admin**: Full system control, user management, workflow configuration, override approvals
- **Manager**: Approve/reject team expenses, view team reports
- **Finance**: Financial approvals in workflow chain
- **Director**: High-level approvals
- **CFO**: Executive approvals with auto-approve capability
- **Employee**: Submit expenses, track own expense history

### 💱 Multi-Currency Support
- **Automatic Conversion**: Real-time currency conversion using Exchange Rate API
- **200+ Countries**: Support for currencies from all countries via REST Countries API
- **Base Currency**: Company-level base currency auto-detected from country
- **Dual Display**: Show both original and converted amounts

### 📊 Advanced Dashboards
- **Real-Time Analytics**: Interactive charts showing expenses by category and status
- **Role-Specific Views**: Customized dashboards for each role
- **Expense Tracking**: Complete visibility of approval status and history
- **Team Management**: Admin panel for creating and managing team members

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Seamless theme switching with proper contrast
- **Responsive Design**: Mobile-friendly layouts with Tailwind CSS
- **Professional Components**: Built with shadcn/ui and Radix UI
- **Real-time Feedback**: Toast notifications and visual validation
- **Beautiful Charts**: Data visualization with Recharts

### 🔒 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt for secure password storage
- **Confirm Password**: Built-in password confirmation on signup
- **Auto-Login**: Seamless signup experience with automatic login
- **Role-Based Routing**: Protected routes based on user roles
- **Company Isolation**: Users can only see their company's data

## 📋 Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS 3** - Utility-first CSS
- **shadcn/ui** - High-quality React components
- **React Router 6** - SPA routing
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend
- **Node.js 20** + Express
- **TypeScript** - Type-safe server code
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Zod** - Runtime validation

### Database
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database access

## 🛠️ Installation

### Prerequisites
- Node.js 20+ and pnpm
- PostgreSQL database

### Quick Start

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd WinzoCoders-Expense_Management
pnpm install
```

2. **Configure environment variables**

Create `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_db?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=8080
```

3. **Set up the database**

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (for development)
pnpm db:push

# OR run migrations (for production)
pnpm db:migrate
```

4. **Start development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
├── client/                      # React frontend
│   ├── pages/                   # Route components
│   │   ├── Index.tsx           # Landing page
│   │   ├── Login.tsx           # Login with auto-redirect
│   │   ├── Signup.tsx          # Company signup with confirm password
│   │   ├── Dashboard.tsx       # Role-based dashboard router
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx  # Admin control panel
│   │   ├── manager/
│   │   │   └── ManagerDashboard.tsx  # Manager approvals
│   │   └── employee/
│   │       └── EmployeeDashboard.tsx  # Employee expenses
│   ├── components/
│   │   ├── Layout.tsx          # App layout with navigation
│   │   ├── ProtectedRoute.tsx  # Role-based route protection
│   │   ├── ThemeToggle.tsx     # Dark/light theme switcher
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/
│   │   └── useAuth.tsx         # Authentication hook
│   └── lib/
│       └── utils.ts            # Utility functions
│
├── server/                      # Express backend
│   ├── routes/
│   │   ├── auth.ts             # Signup, login, JWT generation
│   │   ├── expenses.ts         # CRUD, approvals, admin override
│   │   ├── users.ts            # User management (admin only)
│   │   └── workflows.ts        # Workflow configuration
│   ├── middleware/
│   │   └── auth.ts             # JWT verification, role checks
│   ├── utils/
│   │   ├── auth.ts             # Password hashing, token generation
│   │   └── upload.ts           # Multer configuration
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── store.ts                # In-memory data store (for demo)
│   └── index.ts                # Server entry point
│
└── shared/                      # Shared TypeScript types
    └── api.ts                   # Interface definitions
```

## 🔐 User Roles & Permissions

| Role | Create Company | Manage Users | Set Roles | Configure Workflows | View All Expenses | Override Approvals | Approve Expenses | Submit Expenses |
|------|----------------|--------------|-----------|---------------------|-------------------|-------------------|------------------|-----------------|
| **Admin** | ✅ (on signup) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **CFO** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (via rule) | ✅ | ✅ |
| **Director** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Finance** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Manager** | ❌ | ❌ | ❌ | ❌ | Team only | ❌ | ✅ | ✅ |
| **Employee** | ❌ | ❌ | ❌ | ❌ | Own only | ❌ | ❌ | ✅ |

## 🔄 Approval Workflow System

### Approval Sequence

When an employee submits an expense, it goes through this approval chain:

```
Employee Submits
       ↓
[Manager] (if requireManagerApproval = true AND employee has manager)
       ↓
[Finance] (if Finance user exists in company)
       ↓
[Director] (if Director user exists in company)
       ↓
[CFO] (if CFO user exists in company)
       ↓
APPROVED / REJECTED
```

### Conditional Approval Rules

Admins can configure three powerful approval modes:

#### 1. **Percentage Rule**
```javascript
{
  percentage: 0.6,         // 60% threshold
  cfoOverride: false,
  hybrid: false,
  requireManagerApproval: true
}
```

**Example:**
- Approvers: 5 people
- 3 approve → 60% reached → ✅ **Auto-approved** (remaining approvers skipped)

#### 2. **CFO Override Rule**
```javascript
{
  percentage: 1.0,
  cfoOverride: true,       // CFO auto-approves
  hybrid: false,
  requireManagerApproval: true
}
```

**Example:**
- CFO approves at any step → ✅ **Instantly approved** (all remaining approvers skipped)

#### 3. **Hybrid Mode (Recommended)**
```javascript
{
  percentage: 0.6,
  cfoOverride: true,
  hybrid: true,            // Percentage OR CFO
  requireManagerApproval: true
}
```

**Example:**
- Either 60% approval OR CFO approval → ✅ **Approved**

### Manager Approval Toggle

The `requireManagerApproval` setting controls whether manager approval is mandatory:

| Setting | Employee Has Manager | Result |
|---------|---------------------|--------|
| `true` (default) | Yes | Manager → Finance → Director → CFO |
| `true` | No | Finance → Director → CFO |
| `false` | Yes | Finance → Director → CFO (manager skipped) |
| `false` | No | Finance → Director → CFO |

### Admin Override

Admins can bypass the entire approval workflow:

```
Pending Expense
       ↓
Admin clicks "Override Approve/Reject"
       ↓
Enters mandatory comment
       ↓
✅ Instantly APPROVED/REJECTED
```

**Features:**
- Available only to Admin role
- Requires mandatory comment for accountability
- Creates audit trail entry
- Marks expense with `overriddenBy` and `overriddenAt`
- Visible indicator in UI showing expense was overridden

## 🌐 API Endpoints

### Authentication
```http
POST   /api/auth/signup          # Create company and admin user (auto-login)
POST   /api/auth/login           # User login with JWT
GET    /api/me                   # Get current user info
```

### Users (Admin Only)
```http
GET    /api/users                # List all company users
GET    /api/users/:id            # Get specific user details
POST   /api/users                # Create new user (assign role and manager)
PUT    /api/users/:id            # Update user information
DELETE /api/users/:id            # Delete user
```

### Expenses
```http
GET    /api/expenses             # List expenses (filtered by role)
POST   /api/expenses             # Submit new expense (multipart/form-data for receipt)
POST   /api/expenses/:id/decision       # Approve/reject (sequential approval)
POST   /api/expenses/:id/override       # Admin override (bypass workflow)
```

### Workflows (Admin Only)
```http
GET    /api/workflows            # Get current workflow rules
PUT    /api/workflows            # Update workflow configuration
```

### Reference Data
```http
GET    /api/countries            # List 200+ countries with currencies
GET    /api/rates/:base          # Get exchange rates for base currency
```

## 📊 Dashboard Features

### Admin Dashboard
- **Analytics Section**:
  - Total expenses count
  - Total approved amount
  - Pending review count
  - Team member count
  - Expenses by category (pie chart)
  - Expense status overview (bar chart)

- **User Management**:
  - Create users with role assignment
  - Assign managers to employees
  - Delete users with confirmation
  - View all team members in organized table

- **Workflow Configuration**:
  - Toggle manager approval requirement
  - Set approval percentage threshold
  - Enable/disable CFO override
  - Configure hybrid mode
  - View current workflow settings

- **All Expenses Table**:
  - View every company expense
  - Override approve/reject buttons for pending expenses
  - Visual indicators for overridden expenses
  - Employee name, amount, status display

### Manager Dashboard
- Pending approvals awaiting action
- Approve/reject with optional comments
- Team expense history
- Quick stats (pending, approved, rejected)

### Employee Dashboard
- Submit expense form with:
  - Amount and currency selection
  - Category dropdown
  - Description field
  - Date picker
  - Receipt upload (images/PDFs)
- View own expense history
- Track approval status
- See conversion to company currency

## 🎨 UI/UX Highlights

### Signup Experience
- **Confirm Password**: Side-by-side password fields with real-time validation
- **Password Mismatch Indicator**: Visual feedback when passwords don't match
- **Auto-Login**: Seamless redirect to admin dashboard after signup
- **Country Selection**: 200+ countries with auto-detected currencies
- **Responsive Layout**: Beautiful on mobile and desktop

### Theme Support
- **Dark Theme**: Properly styled dialogs, badges, and all components
- **Light Theme**: Clean, professional appearance
- **Theme Toggle**: Persistent theme preference
- **Proper Contrast**: All text readable in both themes

### Validation & Feedback
- **Real-time Validation**: Instant feedback on form fields
- **Toast Notifications**: Success/error messages for all actions
- **Loading States**: Visual indicators during API calls
- **Error Handling**: Graceful error messages and fallbacks

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- `dist/spa/` - Optimized frontend bundle
- `dist/server/` - Compiled server code

### Start Production Server

```bash
pnpm start
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="strong-random-secret-key"
PORT=8080
NODE_ENV=production
```

### Deployment Platforms

**Recommended:**
- **Vercel/Netlify**: Frontend (SPA)
- **Railway/Render**: Backend + Database
- **Supabase**: PostgreSQL database

**All-in-one:**
- **Railway**: Full-stack deployment
- **Render**: Full-stack deployment

## 🧪 Development

### Available Scripts

```bash
pnpm dev          # Start dev server (client + server, hot reload)
pnpm build        # Production build
pnpm start        # Start production server
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run Vitest tests
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Create and run migrations
pnpm db:studio    # Open Prisma Studio (visual database editor)
```

### Database Management

**Prisma Studio** provides a visual interface:
```bash
pnpm db:studio
```

Access at `http://localhost:5555`

## 📝 Getting Started

### First-Time Setup

1. **Visit the Application**
   - Go to `http://localhost:8080`

2. **Create Your Company**
   - Click "Get Started"
   - Fill in your details:
     - Full name
     - Work email
     - Password (with confirmation)
     - Company name
     - Country (currency auto-detected)
   - You're automatically logged in as Admin!

3. **Configure Workflow**
   - Go to Admin Dashboard
   - Click "Workflow Settings"
   - Set your approval rules:
     - Enable/disable manager approval
     - Set percentage threshold
     - Configure CFO override
     - Enable hybrid mode

4. **Add Team Members**
   - Click "Add User"
   - Set their role (Employee, Manager, Finance, Director, CFO)
   - Assign manager if needed
   - They can now log in!

5. **Start Processing Expenses**
   - Employees submit expenses
   - Approvers receive approval requests
   - Admin can override if needed
   - Track everything in real-time

## 🔧 Configuration Examples

### Example 1: Simple Manager Approval
```javascript
{
  percentage: 1.0,              // 100% must approve
  cfoOverride: false,
  hybrid: false,
  requireManagerApproval: true  // Manager must approve
}
```
**Result:** Manager must approve, then Finance, then Director, then CFO

### Example 2: Fast Approval (60% Rule)
```javascript
{
  percentage: 0.6,              // 60% threshold
  cfoOverride: false,
  hybrid: false,
  requireManagerApproval: true
}
```
**Result:** Once 60% approve, expense auto-approves (faster processing)

### Example 3: Executive Approval (CFO Override)
```javascript
{
  percentage: 1.0,
  cfoOverride: true,            // CFO can auto-approve
  hybrid: false,
  requireManagerApproval: false // Skip manager
}
```
**Result:** Finance → Director → CFO. If CFO approves, instant approval.

### Example 4: Flexible Hybrid (Recommended)
```javascript
{
  percentage: 0.6,
  cfoOverride: true,
  hybrid: true,                 // Use EITHER rule
  requireManagerApproval: true
}
```
**Result:** Manager → Finance → Director → CFO. Approves if 60% approve OR CFO approves.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and type checking
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Review the code documentation
- Check the inline code comments

## 🎯 Future Enhancements

- [ ] Email notifications for approvals
- [ ] Advanced OCR with Tesseract.js
- [ ] Budget tracking and alerts
- [ ] Expense categories management
- [ ] Advanced reporting and exports (PDF, Excel)
- [ ] Mobile app (React Native)
- [ ] Audit logs dashboard
- [ ] Bulk expense upload
- [ ] Recurring expenses
- [ ] Expense policies and limits
- [ ] Integration with accounting software (QuickBooks, Xero)

---

**Built with ❤️ by WinzoCoders**

Using React 18, Express, PostgreSQL, Prisma, TailwindCSS, and modern web technologies.

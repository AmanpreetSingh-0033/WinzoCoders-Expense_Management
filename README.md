# Expence Flow - Modern Expense Management System

A full-stack expense management application with role-based dashboards, multi-level approval workflows, currency conversion, and OCR receipt processing.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Admin, Manager, Finance, Director, CFO, and Employee roles
- **Multi-Level Approval Workflows**: Configurable approval chains (Manager → Finance → Director)
- **Currency Conversion**: Automatic conversion using Exchange Rate API
- **Receipt Upload**: Support for images and PDFs with OCR auto-fill
- **Real-Time Analytics**: Charts and dashboards with expense insights
- **User Management**: Admin panel for creating and managing team members

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Role-based route protection
- Secure file uploads with validation

### API Integrations
- **REST Countries API**: Auto-detect company currency based on country
- **Exchange Rate API**: Real-time currency conversion for expenses

## 📋 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for blazing-fast development
- TailwindCSS 3 + shadcn/ui components
- React Router 6 (SPA mode)
- Recharts for data visualization
- React Query for API state management

### Backend
- Node.js + Express
- TypeScript
- JWT authentication
- Multer for file uploads
- Bcrypt for password hashing

### Database
- PostgreSQL
- Prisma ORM

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database

### Setup Steps

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd oddo
pnpm install
```

2. **Configure environment variables**

Copy `.env.example` to `.env` and update with your values:

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
├── client/                 # React frontend
│   ├── pages/             # Route components
│   │   ├── Index.tsx      # Landing page
│   │   ├── Login.tsx      # Login page
│   │   ├── Signup.tsx     # Company signup
│   │   └── Dashboard.tsx  # Role-based dashboards
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities
│
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── expenses.ts    # Expense CRUD
│   │   ├── users.ts       # User management
│   │   └── workflows.ts   # Workflow configuration
│   ├── middleware/        # Express middleware
│   ├── utils/             # Server utilities
│   ├── prisma/            # Prisma schema
│   └── index.ts           # Server entry point
│
└── shared/                # Shared types between client & server
    └── api.ts             # TypeScript interfaces
```

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage users, configure workflows, view all expenses |
| **Manager** | Approve/reject team expenses, view team reports |
| **Finance** | Approve expenses in workflow chain, view financial reports |
| **Director** | Final approval in multi-level workflows |
| **CFO** | Override approval (if enabled in workflow rules) |
| **Employee** | Submit expenses, track own expense history |

## 🔄 Approval Workflow

### Default Flow
1. Employee submits expense
2. Manager reviews and approves/rejects
3. Finance team reviews (if configured)
4. Director provides final approval (if configured)

### Configurable Rules
- **Percentage Rule**: Require X% of approvers to approve (e.g., 60%)
- **CFO Override**: CFO approval auto-approves entire expense
- **Hybrid Mode**: Either percentage OR CFO override triggers approval

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create company and admin user
- `POST /api/auth/login` - User login
- `GET /api/me` - Get current user info

### Users (Admin only)
- `GET /api/users` - List all company users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Expenses
- `GET /api/expenses` - List expenses (role-filtered)
- `POST /api/expenses` - Submit new expense (with optional receipt upload)
- `POST /api/expenses/:id/decision` - Approve/reject expense

### Workflows (Admin only)
- `GET /api/workflows` - Get workflow rules
- `PUT /api/workflows` - Update workflow rules

### Reference Data
- `GET /api/countries` - List countries with currencies
- `GET /api/rates/:base` - Get exchange rates for base currency

## 📊 Dashboard Features

### Employee Dashboard
- Submit expenses with receipt upload
- OCR auto-fill from receipt text
- View expense history with status tracking
- Export expenses to CSV

### Manager Dashboard
- View pending approvals
- Approve/reject with comments
- Team expense overview

### Admin Dashboard
- **Analytics**: Expense charts by category and status
- **User Management**: Create/edit users, assign roles and managers
- **Workflow Configuration**: Set approval rules and thresholds
- **Company Overview**: View organization details

## 🎨 UI/UX Features

- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Mobile-friendly layouts
- **Modern UI**: shadcn/ui components with TailwindCSS
- **Real-time Notifications**: Toast notifications for user actions
- **Data Visualization**: Interactive charts with Recharts

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

Ensure these are set in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key for JWT signing
- `PORT` - Server port (default: 8080)

## 🧪 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run tests
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
```

### Database Management

**Prisma Studio** provides a visual interface for your database:
```bash
pnpm db:studio
```

## 📝 First-Time Setup Flow

1. Visit the application homepage
2. Click "Get Started" or "Create your company"
3. Fill in:
   - Your name
   - Company name
   - Work email
   - Password
   - Country (currency auto-detected)
4. You're automatically logged in as Admin
5. Add team members via Admin Dashboard
6. Configure approval workflows
7. Team members can start submitting expenses

## 🔧 Configuration

### Workflow Rules

Admins can configure approval logic:

```typescript
{
  percentage: 0.6,        // 60% of approvers must approve
  cfoOverride: true,      // CFO can auto-approve
  hybrid: true            // Use percentage OR CFO override
}
```

### File Upload Limits

- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, PDF
- Files stored in `server/uploads/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Review the code comments

## 🎯 Roadmap

- [ ] Email notifications for approvals
- [ ] Advanced OCR with Tesseract.js
- [ ] Expense categories management
- [ ] Budget tracking and alerts
- [ ] Mobile app (React Native)
- [ ] Advanced reporting and exports
- [ ] Multi-currency support for company base
- [ ] Audit logs and activity tracking

---

Built with ❤️ using React, Express, PostgreSQL, and modern web technologies.

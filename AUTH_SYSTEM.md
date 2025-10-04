# Role-Based Authentication & Access Control System

Complete documentation for the secure authentication and authorization system in Expence Flow.

---

## 🔐 Overview

The application implements a comprehensive role-based access control (RBAC) system with:
- JWT-based authentication
- Six distinct user roles with specific permissions
- Protected routes with role-based access
- Automatic role-based dashboard routing
- Secure password hashing with bcrypt

---

## 👥 User Roles & Permissions

### 1. **Admin**
**Route:** `/admin/dashboard`

**Permissions:**
- ✅ Full system access
- ✅ Create, edit, and delete users
- ✅ Assign roles and managers
- ✅ Configure approval workflows
- ✅ View all company expenses
- ✅ Override any approval
- ✅ Access company settings

**Dashboard Features:**
- User management with role assignment
- Workflow configuration (percentage, CFO override, hybrid mode)
- Company-wide expense analytics
- Pie charts for expense categories
- Bar charts for expense status
- Team member overview

---

### 2. **Manager**
**Route:** `/manager/dashboard`

**Permissions:**
- ✅ Approve/reject team expenses
- ✅ View team expense reports
- ✅ Add comments to expenses
- ✅ View pending approvals
- ❌ Cannot create users
- ❌ Cannot modify workflows

**Dashboard Features:**
- Pending approvals queue
- Team expense summary
- Approval history
- Quick approve/reject actions
- Comment functionality

---

### 3. **Finance**
**Route:** `/manager/dashboard` (shared with Manager)

**Permissions:**
- ✅ Approve expenses in workflow chain
- ✅ View financial reports
- ✅ Access all company expenses
- ✅ Add financial comments
- ❌ Cannot create users
- ❌ Cannot modify workflows

**Dashboard Features:**
- Same as Manager dashboard
- Financial-focused expense views
- Approval workflow participation

---

### 4. **Director**
**Route:** `/manager/dashboard` (shared with Manager)

**Permissions:**
- ✅ Final approval in multi-level workflows
- ✅ View all expenses
- ✅ Override lower-level approvals
- ❌ Cannot create users
- ❌ Cannot modify workflows

**Dashboard Features:**
- Same as Manager dashboard
- High-level expense overview
- Final approval authority

---

### 5. **CFO**
**Route:** `/manager/dashboard` (shared with Manager)

**Permissions:**
- ✅ Auto-approve expenses (if CFO override enabled)
- ✅ View all financial data
- ✅ Override any approval
- ✅ Access financial analytics
- ❌ Cannot create users
- ❌ Cannot modify workflows

**Dashboard Features:**
- Same as Manager dashboard
- CFO override capability
- Financial analytics focus

---

### 6. **Employee**
**Route:** `/employee/dashboard`

**Permissions:**
- ✅ Submit new expenses
- ✅ Upload receipts
- ✅ View own expense history
- ✅ Track approval status
- ✅ Export personal expenses to CSV
- ❌ Cannot view others' expenses
- ❌ Cannot approve expenses
- ❌ Cannot access admin features

**Dashboard Features:**
- Expense submission form
- Receipt upload (images, PDFs)
- OCR quick-paste for auto-fill
- Personal expense history
- Status tracking (Pending, Approved, Rejected)
- CSV export

---

## 🔑 Authentication Flow

### 1. **Signup Process**

```typescript
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "admin@company.com",
  "password": "securepassword",
  "companyName": "Acme Inc",
  "country": "United States"
}
```

**What Happens:**
1. Password is hashed with bcrypt (10 rounds)
2. Company is created with auto-detected currency (REST Countries API)
3. User is created with ADMIN role
4. Demo users (Manager, Employee) are auto-created
5. JWT token is generated and returned
6. User is redirected to `/admin/dashboard`

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "admin@company.com",
    "role": "ADMIN",
    "companyId": "uuid",
    "managerId": null
  },
  "company": {
    "id": "uuid",
    "name": "Acme Inc",
    "country": "United States",
    "currency": "USD",
    "rules": {
      "percentage": 0.6,
      "cfoOverride": true,
      "hybrid": true
    }
  }
}
```

---

### 2. **Login Process**

```typescript
POST /api/auth/login
{
  "email": "admin@company.com",
  "password": "securepassword"
}
```

**What Happens:**
1. Email is looked up in database
2. Password is verified with bcrypt
3. JWT token is generated with user role and company ID
4. Token is returned to client
5. User is redirected based on role:
   - ADMIN → `/admin/dashboard`
   - MANAGER/FINANCE/DIRECTOR/CFO → `/manager/dashboard`
   - EMPLOYEE → `/employee/dashboard`

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "role": "ADMIN",
  "companyId": "company-uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

### 3. **Token Storage & Usage**

**Client-Side:**
- Token stored in `localStorage` as JSON
- Automatically attached to API requests via `Authorization: Bearer <token>`
- Token persists across page refreshes

**Server-Side:**
- Token verified on every protected route
- Role extracted from token payload
- Company ID used for data isolation

---

## 🛡️ Route Protection

### Frontend Protection

**ProtectedRoute Component:**
```typescript
<ProtectedRoute allowedRoles={["ADMIN"]}>
  <AdminDashboard />
</ProtectedRoute>
```

**Features:**
- Checks if user is authenticated
- Verifies user has required role
- Shows loading state during auth check
- Redirects to `/login` if not authenticated
- Shows "Access Denied" page if wrong role
- Provides "Go Back" and "Go to My Dashboard" buttons

**Access Denied Screen:**
- Clear error message
- Shows current user role
- Navigation options
- Professional UI with icons

---

### Backend Protection

**Middleware:**
```typescript
// Require authentication
app.get("/api/expenses", requireAuth, listExpenses);

// Require specific role
app.post("/api/users", requireAuth, requireRole(["ADMIN"]), createUser);
```

**requireAuth Middleware:**
- Extracts JWT from `Authorization` header
- Verifies token signature
- Decodes user info (id, role, companyId)
- Attaches user to request object
- Returns 401 if invalid

**requireRole Middleware:**
- Checks if user has one of the allowed roles
- Returns 403 if unauthorized
- Allows multiple roles per route

---

## 🔒 Security Features

### 1. **Password Security**
- **Hashing:** bcrypt with 10 salt rounds
- **Storage:** Only hashed passwords stored in database
- **Verification:** Constant-time comparison
- **Never Exposed:** Password hashes never sent to client

### 2. **JWT Security**
- **Secret:** Strong secret key from environment variable
- **Expiration:** 7-day token lifetime
- **Payload:** Minimal data (id, role, companyId)
- **Signature:** HMAC SHA256
- **Verification:** Every request validated

### 3. **API Security**
- **CORS:** Configured for allowed origins
- **Input Validation:** Zod schemas on all inputs
- **SQL Injection:** Prevented by Prisma ORM
- **XSS Protection:** React auto-escapes output
- **Role Isolation:** Company-scoped data access

### 4. **File Upload Security**
- **Type Validation:** Only images and PDFs allowed
- **Size Limit:** 5MB maximum
- **Filename Sanitization:** UUID-based filenames
- **Storage:** Separate uploads directory
- **Access Control:** Only authenticated users

---

## 📊 Role-Based Dashboard Features

### Admin Dashboard
```
┌─────────────────────────────────────────┐
│  Admin Dashboard                        │
├─────────────────────────────────────────┤
│  📊 Stats Cards                         │
│  - Total Expenses                       │
│  - Total Approved Amount                │
│  - Pending Count                        │
│  - Team Members                         │
├─────────────────────────────────────────┤
│  📈 Charts                              │
│  - Expenses by Category (Pie Chart)    │
│  - Expense Status (Bar Chart)          │
├─────────────────────────────────────────┤
│  👥 User Management                     │
│  - Create User Dialog                   │
│  - User List Table                      │
│  - Role Assignment                      │
│  - Manager Assignment                   │
├─────────────────────────────────────────┤
│  ⚙️ Workflow Configuration              │
│  - Approval Percentage                  │
│  - CFO Override Toggle                  │
│  - Hybrid Mode Toggle                   │
│  - Company Information                  │
└─────────────────────────────────────────┘
```

### Manager Dashboard
```
┌─────────────────────────────────────────┐
│  Manager Dashboard                      │
├─────────────────────────────────────────┤
│  📊 Stats Cards                         │
│  - Pending Approvals                    │
│  - Approved This Month                  │
│  - Total Approved Amount                │
├─────────────────────────────────────────┤
│  ✅ Pending Approvals Table             │
│  - Date, Employee, Category             │
│  - Amount (with currency conversion)    │
│  - Approve/Reject Buttons               │
│  - Comment Functionality                │
├─────────────────────────────────────────┤
│  📋 Recent Activity                     │
│  - All team expenses                    │
│  - Status badges                        │
│  - Filterable list                      │
└─────────────────────────────────────────┘
```

### Employee Dashboard
```
┌─────────────────────────────────────────┐
│  Employee Dashboard                     │
├─────────────────────────────────────────┤
│  📊 Stats Cards                         │
│  - Total Submitted                      │
│  - Pending                              │
│  - Approved                             │
│  - Rejected                             │
├─────────────────────────────────────────┤
│  📝 Submit New Expense Form             │
│  - Amount & Currency                    │
│  - Category & Date                      │
│  - Description                          │
│  - Receipt Upload                       │
│  - OCR Quick Paste                      │
├─────────────────────────────────────────┤
│  📊 Personal Summary                    │
│  - Status breakdown                     │
│  - Total approved amount                │
│  - Export CSV button                    │
├─────────────────────────────────────────┤
│  📋 Expense History Table               │
│  - Date, Category, Description          │
│  - Amount with status badges            │
│  - Full submission history              │
└─────────────────────────────────────────┘
```

---

## 🚀 Usage Examples

### Creating a New User (Admin Only)

```typescript
// Frontend
const createUser = async () => {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Jane Smith",
      email: "jane@company.com",
      password: "securepass",
      role: "EMPLOYEE",
      managerId: "manager-uuid"
    })
  });
  
  if (res.ok) {
    const user = await res.json();
    console.log("User created:", user);
  }
};
```

### Approving an Expense (Manager)

```typescript
// Frontend
const approveExpense = async (expenseId: string) => {
  const comment = prompt("Add a comment (optional)");
  
  const res = await fetch(`/api/expenses/${expenseId}/decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      decision: "APPROVED",
      comment
    })
  });
  
  if (res.ok) {
    toast.success("Expense approved");
  }
};
```

### Submitting an Expense (Employee)

```typescript
// Frontend
const submitExpense = async () => {
  const formData = new FormData();
  formData.append("amount", "120.50");
  formData.append("currency", "EUR");
  formData.append("category", "Meals");
  formData.append("description", "Team lunch");
  formData.append("date", "2025-10-04");
  formData.append("receipt", receiptFile);
  
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  
  if (res.ok) {
    toast.success("Expense submitted");
  }
};
```

---

## 🧪 Testing the Auth System

### Test Users (Auto-Created on Signup)

After first signup, these demo users are created:

1. **Admin** (your signup credentials)
   - Role: ADMIN
   - Access: Full system

2. **Manager** (auto-created)
   - Email: `manager@example.com`
   - Password: Same as admin password
   - Role: MANAGER

3. **Employee** (auto-created)
   - Email: `employee@example.com`
   - Password: Same as admin password
   - Role: EMPLOYEE
   - Manager: Auto-assigned to Manager user

### Testing Scenarios

**1. Test Role-Based Access:**
```bash
# Login as Admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"yourpassword"}'

# Try to access admin route with employee token (should fail)
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <employee-token>"
```

**2. Test Approval Workflow:**
- Login as Employee
- Submit expense
- Login as Manager
- Approve expense
- Verify status changed

**3. Test Dashboard Routing:**
- Login as different roles
- Verify automatic redirect to correct dashboard
- Try to access wrong dashboard (should see Access Denied)

---

## 🔧 Configuration

### Environment Variables

```env
# JWT Secret (REQUIRED)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/expense_db"

# Server Port
PORT=8080
```

### Workflow Rules (Admin Configurable)

```typescript
{
  percentage: 0.6,        // 60% of approvers must approve
  cfoOverride: true,      // CFO can auto-approve
  hybrid: true            // Use percentage OR CFO override
}
```

---

## 📝 Best Practices

### For Admins
1. Use strong JWT secret in production
2. Regularly review user roles
3. Configure appropriate workflow rules
4. Monitor approval patterns
5. Backup user data regularly

### For Developers
1. Always use `requireAuth` middleware
2. Add `requireRole` for sensitive endpoints
3. Never expose password hashes
4. Validate all inputs with Zod
5. Test with different roles
6. Keep JWT secret secure

### For Users
1. Use strong passwords
2. Don't share credentials
3. Log out on shared devices
4. Report suspicious activity
5. Keep receipts for submitted expenses

---

## 🐛 Troubleshooting

### "Access Denied" Error
- **Cause:** User doesn't have required role
- **Solution:** Contact admin to update your role

### "Unauthorized" Error
- **Cause:** Invalid or expired token
- **Solution:** Log out and log in again

### Can't Create Users
- **Cause:** Not logged in as Admin
- **Solution:** Only Admins can create users

### Wrong Dashboard After Login
- **Cause:** Role mismatch or routing issue
- **Solution:** Clear browser cache and log in again

---

## 🎯 Summary

The Expence Flow authentication system provides:
- ✅ Secure JWT-based authentication
- ✅ Six distinct user roles
- ✅ Role-based dashboard routing
- ✅ Protected API endpoints
- ✅ Bcrypt password hashing
- ✅ Automatic role-based redirects
- ✅ Access denied screens
- ✅ Company-scoped data isolation
- ✅ Multi-level approval workflows
- ✅ Comprehensive security features

All authentication and authorization is production-ready and follows industry best practices.

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0

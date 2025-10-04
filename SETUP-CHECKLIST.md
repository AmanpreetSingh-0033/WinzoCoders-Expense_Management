# ExpenseFlow - Setup Checklist

Use this checklist to ensure proper setup and deployment.

## ✅ Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js 16+ installed
- [ ] npm installed
- [ ] Supabase account created
- [ ] Supabase project created

### Database Setup
- [ ] Copy contents of `database-schema.sql`
- [ ] Open Supabase SQL Editor
- [ ] Run the migration SQL
- [ ] Verify all tables created:
  - [ ] companies
  - [ ] users
  - [ ] expenses
  - [ ] approval_rules
  - [ ] approval_history
- [ ] Verify RLS is enabled on all tables
- [ ] Verify indexes are created

### Environment Variables
- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Both values are from your Supabase project

### Application Setup
- [ ] Run `npm install`
- [ ] No installation errors
- [ ] All dependencies installed

### Test Build
- [ ] Run `npm run build`
- [ ] Build completes successfully
- [ ] No TypeScript/ESLint errors
- [ ] `dist/` folder created

### Development Server
- [ ] Run `npm run dev`
- [ ] Server starts on port 5173
- [ ] No console errors
- [ ] Can access http://localhost:5173

## ✅ First Run Checklist

### Create Admin Account
- [ ] Navigate to signup page
- [ ] Fill in all required fields
- [ ] Select country (sets currency)
- [ ] Successfully create account
- [ ] Redirected to dashboard
- [ ] See admin role in sidebar

### Test Dashboard
- [ ] Dashboard loads without errors
- [ ] See welcome message with your name
- [ ] Statistics cards display (all zeros initially)
- [ ] Can navigate to different pages
- [ ] Sidebar shows all admin menu items

### Create Test Users
- [ ] Go to "Manage Users"
- [ ] Create a Manager user
  - [ ] Set role to "manager"
  - [ ] User created successfully
- [ ] Create an Employee user
  - [ ] Set role to "employee"
  - [ ] Assign to manager
  - [ ] Enable "Manager must approve first"
  - [ ] User created successfully
- [ ] See all users in the table

### Create Approval Rule
- [ ] Go to "Approval Rules"
- [ ] Click "Add Rule"
- [ ] Fill in rule details:
  - [ ] Name: "Test Rule"
  - [ ] Amount threshold: 0
  - [ ] Add yourself as approver
- [ ] Rule created successfully
- [ ] Rule appears in list
- [ ] Rule is marked as "Active"

### Test Expense Submission
- [ ] Log out
- [ ] Log in as Employee
- [ ] Go to "Submit Expense"
- [ ] Fill in expense details
- [ ] Submit successfully
- [ ] Redirected to "My Expenses"
- [ ] Expense appears with "pending" status

### Test Approval Flow
- [ ] Log out
- [ ] Log in as Admin (or Manager if applicable)
- [ ] Go to "Approvals"
- [ ] See the test expense
- [ ] Click "Review"
- [ ] Modal opens with expense details
- [ ] Add comment (optional)
- [ ] Click "Approve"
- [ ] Success notification appears
- [ ] Expense disappears from pending list

### Verify Approval
- [ ] Log out
- [ ] Log in as Employee again
- [ ] Go to "My Expenses"
- [ ] Expense status is "approved"
- [ ] Click "View" on expense
- [ ] See approval history
- [ ] See approver name and comment

## ✅ Feature Testing Checklist

### Authentication
- [ ] Can sign up new account
- [ ] Can log in
- [ ] Can log out
- [ ] Protected routes work
- [ ] Redirect to login when not authenticated
- [ ] Session persists on refresh

### Role-Based Access
- [ ] Employee cannot access admin pages
- [ ] Manager can access approvals page
- [ ] Admin can access all pages
- [ ] Proper navigation menu per role

### Expense Management
- [ ] Can submit expense
- [ ] Can view own expenses
- [ ] Can filter by status
- [ ] Can view expense details
- [ ] Can see approval history
- [ ] Currency conversion works

### User Management (Admin)
- [ ] Can create users
- [ ] Can edit users
- [ ] Can delete users (not self)
- [ ] Can assign managers
- [ ] Can toggle manager approver flag

### Approval Rules (Admin)
- [ ] Can create rules
- [ ] Can edit rules
- [ ] Can delete rules
- [ ] Can activate/deactivate rules
- [ ] Can set percentage threshold
- [ ] Can add approval sequence

### Company Settings (Admin)
- [ ] Can view company info
- [ ] Can update company name
- [ ] Can change country
- [ ] Can change currency
- [ ] Changes persist

### Approval Workflows
- [ ] Sequential approval works
- [ ] Manager-first approval works
- [ ] Percentage-based auto-approve works
- [ ] Comments are saved
- [ ] History is tracked

### Currency Features
- [ ] Multiple currencies available
- [ ] Conversion happens automatically
- [ ] Original amount preserved
- [ ] Company currency displays correctly
- [ ] Exchange rates fetch (or fallback)

### UI/UX
- [ ] Notifications appear
- [ ] Loading states show
- [ ] Error messages display
- [ ] Forms validate input
- [ ] Modals open/close properly
- [ ] Navigation works smoothly
- [ ] Responsive on mobile

## ✅ Production Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] No console errors in dev
- [ ] Environment variables documented

### Build & Deploy
- [ ] Run `npm run build`
- [ ] Build succeeds
- [ ] Review bundle size
- [ ] Deploy `dist/` folder to hosting
- [ ] Set production environment variables

### Post-Deployment Verification
- [ ] Production site loads
- [ ] Can sign up
- [ ] Can log in
- [ ] Database connection works
- [ ] All pages load correctly
- [ ] No console errors

### Security Check
- [ ] Environment variables secure
- [ ] No sensitive data in client code
- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] Authentication working

### Performance Check
- [ ] Page load time acceptable
- [ ] API calls complete quickly
- [ ] No memory leaks
- [ ] Bundle size reasonable

## ✅ Documentation Checklist

- [ ] README.md reviewed
- [ ] QUICKSTART.md followed successfully
- [ ] API-REFERENCE.md accurate
- [ ] PROJECT-SUMMARY.md complete
- [ ] database-schema.sql documented

## ✅ Support Checklist

### For Issues
- [ ] Check browser console
- [ ] Check Supabase logs
- [ ] Verify database migration
- [ ] Check RLS policies
- [ ] Verify environment variables

### Common Solutions
- [ ] Clear browser cache
- [ ] Clear localStorage
- [ ] Re-run database migration
- [ ] Reinstall node_modules
- [ ] Check network requests

## Status Tracker

**Setup Date:** __________

**Setup By:** __________

**Production URL:** __________

**Issues Encountered:**
-
-

**Notes:**
-
-

---

## Quick Reference

### Start Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Required Environment Variables
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### First User (Created via Signup)
- Email: __________
- Role: Admin
- Company: __________

---

**Last Updated:** 2025-10-04
**Version:** 1.0.0

# ExpenseFlow - Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Run the Database Migration
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `database-schema.sql`
4. Click "Run" to create all tables and policies

### Step 2: Start the Application
```bash
npm install
npm run dev
```

### Step 3: Create Your Account
1. Open http://localhost:5173
2. Click "Sign up"
3. Fill in:
   - Your name
   - Email
   - Company name
   - Country (this sets your default currency)
   - Password
4. You're now an Admin!

### Step 4: Add Team Members
1. Go to "Manage Users" (admin menu)
2. Click "Add User"
3. Create a Manager and an Employee

### Step 5: Create an Approval Rule
1. Go to "Approval Rules" (admin menu)
2. Click "Add Rule"
3. Example rule:
   - Name: "Standard Approval"
   - Amount threshold: 0 (applies to all expenses)
   - Add yourself as an approver
   - Leave percentage at 0 for now
   - Click "Create Rule"

### Step 6: Submit Your First Expense
1. Log out and log in as the Employee
2. Go to "Submit Expense"
3. Fill in:
   - Title: "Test Expense"
   - Amount: 100
   - Category: Travel
   - Today's date
4. Submit!

### Step 7: Approve the Expense
1. Log out and log in as Admin
2. Go to "Approvals"
3. You'll see the test expense
4. Click "Review" → "Approve"
5. Done!

## Common Workflows

### Workflow 1: Manager Must Approve First
When creating/editing an employee:
1. Set their manager
2. Check "Manager must approve first"
3. Now all their expenses go to manager first

### Workflow 2: Percentage-Based Approval
Create a rule with:
- Percentage threshold: 60
- Add 3 approvers in sequence
- When 2 out of 3 approve (60%+), expense auto-approves

### Workflow 3: CFO Auto-Approval
Create a rule with:
- Add specific approver (CFO user ID)
- When CFO approves, expense auto-approves regardless of others

### Workflow 4: Hybrid Rule
Create a rule with:
- Percentage threshold: 60
- Specific approver: CFO
- Check "Hybrid Rule"
- Now EITHER 60% approval OR CFO approval triggers auto-approval

## Testing Checklist

### As Admin
- [ ] Create users (manager, employee)
- [ ] Create approval rules
- [ ] View all expenses
- [ ] Update company settings

### As Manager
- [ ] Submit expense
- [ ] Approve team member's expense
- [ ] View pending approvals

### As Employee
- [ ] Submit expense
- [ ] View my expenses
- [ ] Check expense status
- [ ] See approval history

## Troubleshooting

### "Failed to load expenses"
- Check that database migration ran successfully
- Verify user is assigned to a company
- Check browser console for errors

### "Not authorized to approve"
- Ensure you're the current approver in sequence
- Check approval rules are configured correctly

### "User not found"
- Verify user exists in both auth.users and users tables
- Check company_id is set correctly

## Next Steps

1. Explore currency conversion with different currencies
2. Create complex approval rules
3. Test the full approval workflow
4. Add more team members
5. Configure company settings

## Demo Credentials (After Setup)

Admin Account:
- Email: [Your signup email]
- Password: [Your signup password]
- Role: Admin
- Can: Everything

You can create additional test accounts:
- manager@test.com (Manager role)
- employee@test.com (Employee role)

## Support

Check README.md for detailed documentation including:
- Complete feature list
- API documentation
- Security model
- Advanced configurations

# ExpenseFlow - API Reference

## Authentication Service (`authService.js`)

### signUp(email, password, userData)
Creates a new user account and profile.

```javascript
const userData = {
  name: 'John Doe',
  role: 'employee',
  company_id: 'uuid-here'
};

const result = await authService.signUp('john@example.com', 'password123', userData);
```

**Parameters:**
- `email` (string) - User email
- `password` (string) - User password (min 6 characters)
- `userData` (object):
  - `name` (string) - User's full name
  - `role` (string) - 'admin', 'manager', or 'employee'
  - `company_id` (uuid) - Company ID

**Returns:** Auth data object

---

### signIn(email, password)
Authenticates user and returns session.

```javascript
const data = await authService.signIn('john@example.com', 'password123');
```

**Returns:** Session data with user info

---

### signOut()
Logs out current user.

```javascript
await authService.signOut();
```

---

### getCurrentUser()
Gets current authenticated user with profile.

```javascript
const user = await authService.getCurrentUser();
// Returns: { id, email, name, role, company_id, companies: {...}, ... }
```

---

### onAuthStateChange(callback)
Listens for authentication state changes.

```javascript
const subscription = authService.onAuthStateChange((user) => {
  console.log('User:', user);
});

// Later: subscription.unsubscribe()
```

---

## Expense Service (`expenseService.js`)

### createExpense(expenseData)
Submits a new expense claim.

```javascript
const expenseData = {
  title: 'Client Dinner',
  description: 'Dinner with ABC Corp',
  amount: 150.00,
  currency: 'USD',
  category: 'Food & Dining',
  expense_date: '2025-10-04'
};

const expense = await expenseService.createExpense(expenseData);
```

**Auto-performs:**
- Currency conversion to company default
- Builds approval sequence from rules
- Creates initial audit entry

---

### getExpenses(filters)
Retrieves expenses with optional filters.

```javascript
const expenses = await expenseService.getExpenses({
  status: 'pending',
  submitter_id: 'user-uuid',
  company_id: 'company-uuid'
});
```

**Filters:**
- `status` - 'pending', 'approved', 'rejected', 'escalated'
- `submitter_id` - Filter by submitter
- `company_id` - Filter by company

---

### getExpenseById(id)
Gets detailed expense information including history.

```javascript
const expense = await expenseService.getExpenseById('expense-uuid');
```

**Returns:**
- Complete expense details
- Submitter info
- Approval history with approver details

---

### getPendingApprovals(userId)
Gets expenses waiting for specific user's approval.

```javascript
const pending = await expenseService.getPendingApprovals(currentUserId);
```

**Returns:** Array of expenses where user is current approver

---

### approveExpense(expenseId, approverId, comment)
Approves an expense in the workflow.

```javascript
const result = await expenseService.approveExpense(
  'expense-uuid',
  'approver-uuid',
  'Approved - looks good'
);
```

**Logic:**
- Validates current approver
- Updates approval sequence
- Moves to next approver or auto-approves based on rules
- Creates audit history entry

**Returns:** `{ success: true, status: 'pending' | 'approved' }`

---

### rejectExpense(expenseId, approverId, comment)
Rejects an expense.

```javascript
const result = await expenseService.rejectExpense(
  'expense-uuid',
  'approver-uuid',
  'Missing receipt'
);
```

**Note:** Comment is required for rejection

---

### deleteExpense(expenseId)
Deletes an expense (admin only).

```javascript
await expenseService.deleteExpense('expense-uuid');
```

---

## User Service (`userService.js`)

### getUsers(companyId)
Lists all users in a company.

```javascript
const users = await userService.getUsers('company-uuid');
```

---

### getUserById(userId)
Gets user details with manager and company info.

```javascript
const user = await userService.getUserById('user-uuid');
```

---

### createUser(userData)
Creates a new user (admin only).

```javascript
const userData = {
  email: 'newuser@example.com',
  password: 'password123',
  name: 'New User',
  role: 'employee',
  company_id: 'company-uuid',
  manager_id: 'manager-uuid',
  is_manager_approver: true
};

const user = await userService.createUser(userData);
```

---

### updateUser(userId, updates)
Updates user information.

```javascript
const updates = {
  name: 'Updated Name',
  role: 'manager',
  manager_id: 'new-manager-uuid',
  is_manager_approver: true
};

const user = await userService.updateUser('user-uuid', updates);
```

---

### deleteUser(userId)
Deletes a user.

```javascript
await userService.deleteUser('user-uuid');
```

---

### getManagers(companyId)
Gets list of managers and admins in a company.

```javascript
const managers = await userService.getManagers('company-uuid');
```

---

### getTeamMembers(managerId)
Gets employees reporting to a manager.

```javascript
const team = await userService.getTeamMembers('manager-uuid');
```

---

## Company Service (`companyService.js`)

### createCompany(companyData)
Creates a new company.

```javascript
const companyData = {
  name: 'Acme Corp',
  country: 'US',
  approval_config: {}
};

const company = await companyService.createCompany(companyData);
```

**Note:** Currency is auto-set based on country

---

### getCompanyById(companyId)
Gets company information.

```javascript
const company = await companyService.getCompanyById('company-uuid');
```

---

### updateCompany(companyId, updates)
Updates company settings.

```javascript
const updates = {
  name: 'Updated Corp',
  country: 'GB',
  currency: 'GBP',
  approval_config: { ... }
};

const company = await companyService.updateCompany('company-uuid', updates);
```

---

## Approval Rule Service (`approvalRuleService.js`)

### createRule(ruleData)
Creates a new approval rule.

```javascript
const ruleData = {
  company_id: 'company-uuid',
  name: 'Standard Approval',
  sequence: [
    { user_id: 'user1-uuid', name: 'Manager', role: 'manager', required: true },
    { user_id: 'user2-uuid', name: 'Director', role: 'admin', required: true }
  ],
  percentage_threshold: 60,
  specific_approver_ids: ['cfo-uuid'],
  is_hybrid: true,
  amount_threshold: 1000,
  is_active: true
};

const rule = await approvalRuleService.createRule(ruleData);
```

**Fields:**
- `sequence` - Ordered array of approvers
- `percentage_threshold` - Auto-approve at X% (0-100)
- `specific_approver_ids` - Users who can auto-approve
- `is_hybrid` - Use OR logic (percentage OR specific approver)
- `amount_threshold` - Apply rule only if expense >= this amount

---

### getRules(companyId)
Gets all approval rules for a company.

```javascript
const rules = await approvalRuleService.getRules('company-uuid');
```

---

### updateRule(ruleId, updates)
Updates an approval rule.

```javascript
const updates = {
  name: 'Updated Rule',
  percentage_threshold: 75,
  is_active: true
};

await approvalRuleService.updateRule('rule-uuid', updates);
```

---

### deleteRule(ruleId)
Deletes an approval rule.

```javascript
await approvalRuleService.deleteRule('rule-uuid');
```

---

### toggleRuleStatus(ruleId, isActive)
Activates or deactivates a rule.

```javascript
await approvalRuleService.toggleRuleStatus('rule-uuid', false);
```

---

## Currency Service (`currencyService.js`)

### fetchExchangeRates(baseCurrency)
Gets current exchange rates.

```javascript
const rates = await fetchExchangeRates('USD');
// Returns: { EUR: 0.85, GBP: 0.73, ... }
```

**Caching:** Rates cached for 1 hour

---

### convertCurrency(amount, fromCurrency, toCurrency)
Converts amount between currencies.

```javascript
const converted = await convertCurrency(100, 'USD', 'EUR');
// Returns: 85.00 (approximately)
```

---

### formatCurrency(amount, currency)
Formats amount with currency symbol.

```javascript
const formatted = formatCurrency(100, 'USD');
// Returns: "$100.00"
```

---

## Data Models

### Expense Object
```javascript
{
  id: 'uuid',
  title: 'string',
  description: 'string',
  amount: 100.00,
  currency: 'USD',
  converted_amount: 100.00,
  category: 'Travel',
  expense_date: '2025-10-04',
  submitter_id: 'uuid',
  company_id: 'uuid',
  status: 'pending',
  current_approver_index: 0,
  approval_sequence: [
    {
      user_id: 'uuid',
      role: 'manager',
      name: 'John Doe',
      status: 'pending',
      required: true
    }
  ],
  metadata: {},
  created_at: 'timestamp',
  updated_at: 'timestamp'
}
```

### User Object
```javascript
{
  id: 'uuid',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'employee',
  company_id: 'uuid',
  manager_id: 'uuid',
  is_manager_approver: false,
  companies: {
    id: 'uuid',
    name: 'Acme Corp',
    currency: 'USD',
    ...
  },
  created_at: 'timestamp',
  updated_at: 'timestamp'
}
```

### Approval Rule Object
```javascript
{
  id: 'uuid',
  company_id: 'uuid',
  name: 'Standard Approval',
  sequence: [...],
  percentage_threshold: 60,
  specific_approver_ids: ['uuid'],
  is_hybrid: true,
  amount_threshold: 1000,
  is_active: true,
  created_at: 'timestamp',
  updated_at: 'timestamp'
}
```

---

## Error Handling

All service methods throw errors that should be caught:

```javascript
try {
  await expenseService.createExpense(data);
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

Common error types:
- Authentication errors: "Not authenticated"
- Authorization errors: "Not authorized"
- Validation errors: "Invalid input"
- Not found errors: "Not found"

---

## Best Practices

1. **Always check authentication** before calling services
2. **Handle errors gracefully** with try-catch
3. **Show loading states** during async operations
4. **Validate input** on client-side before submission
5. **Use notifications** to provide user feedback
6. **Cache data** when appropriate to reduce API calls
7. **Follow RLS policies** - they're enforced server-side

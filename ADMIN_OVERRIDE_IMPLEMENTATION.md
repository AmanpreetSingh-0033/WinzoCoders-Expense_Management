# Admin Override Implementation

## Overview

Admins can now **override expense approvals** at any time, regardless of the current approval workflow. This provides emergency approval/rejection capabilities and complete administrative control.

---

## Features Implemented

### ✅ 1. Backend API Endpoint

**Route:** `POST /api/expenses/:id/override`

**Access:** Admin only (protected by `requireRole(["ADMIN"])` middleware)

**Request Body:**
```json
{
  "decision": "APPROVED" | "REJECTED",
  "comment": "Required reason for override"
}
```

**Response:**
```json
{
  "id": "expense-id",
  "status": "APPROVED", // Updated status
  "overriddenBy": "admin-user-id",
  "overriddenAt": "2025-10-04T12:00:00.000Z",
  "approvals": [
    // ... existing approvals
    {
      "expenseId": "expense-id",
      "approverId": "admin-user-id",
      "decision": "APPROVED",
      "comment": "[ADMIN OVERRIDE] Urgent approval needed for client meeting",
      "decidedAt": "2025-10-04T12:00:00.000Z",
      "isOverride": true
    }
  ]
}
```

**Key Behaviors:**
- ✅ Only admins can access this endpoint
- ✅ Comment is **required** (ensures accountability)
- ✅ Instantly changes expense status (bypasses workflow)
- ✅ Adds audit trail entry to approvals
- ✅ Marks expense with `overriddenBy` and `overriddenAt`

---

### ✅ 2. Enhanced Data Model

**Updated `Expense` interface:**
```typescript
export interface Expense {
  // ... existing fields
  overriddenBy?: string;      // Admin user ID who performed override
  overriddenAt?: string;       // ISO timestamp of override
}
```

**Updated `Approval` interface:**
```typescript
export interface Approval {
  // ... existing fields
  isOverride?: boolean;        // Marks admin override approvals
}
```

**New `AdminOverrideInput` interface:**
```typescript
export interface AdminOverrideInput {
  decision: "APPROVED" | "REJECTED";
  comment: string;  // Required for overrides
}
```

---

### ✅ 3. Admin Dashboard UI

**New Section:** "All Expenses" table with override actions

**Features:**
- Displays all company expenses in a table
- Shows employee name, description, amount, and status
- Provides override buttons for pending expenses
- Visual indicators for already overridden expenses

**UI Components:**
```tsx
// For pending expenses:
<Button onClick={() => handleOverride(id, "APPROVED")}>
  Override Approve
</Button>
<Button onClick={() => handleOverride(id, "REJECTED")}>
  Override Reject
</Button>

// Visual indicators:
{isOverridden && (
  <Badge>Overridden</Badge>
)}
```

**User Flow:**
1. Admin clicks "Override Approve" or "Override Reject"
2. System prompts for mandatory comment
3. If comment provided, sends override request
4. Shows success toast and refreshes expense list
5. Expense status updated instantly

---

## Audit Trail

Every admin override is tracked with:

1. **Expense Level:**
   - `overriddenBy` - Admin user ID
   - `overriddenAt` - Timestamp

2. **Approval Level:**
   - New approval entry added to `approvals[]`
   - `isOverride: true` flag
   - Comment prefixed with `[ADMIN OVERRIDE]`
   - Full timestamp and admin ID

**Example Audit Trail:**
```typescript
expense.approvals = [
  // Normal approval flow
  { approverId: "manager-id", decision: "APPROVED", ... },
  { approverId: "finance-id", decision: "PENDING", ... },
  
  // Admin override
  {
    approverId: "admin-id",
    decision: "APPROVED",
    comment: "[ADMIN OVERRIDE] Client presentation urgency",
    decidedAt: "2025-10-04T12:00:00.000Z",
    isOverride: true
  }
];
```

---

## Security & Validation

### Backend Protection:
```typescript
// 1. Role-based access control
app.post("/api/expenses/:id/override", 
  requireAuth, 
  requireRole(["ADMIN"]),  // Only admins
  adminOverride
);

// 2. Comment validation
z.object({ 
  decision: z.enum(["APPROVED", "REJECTED"]), 
  comment: z.string().min(1, "Comment is required")
});

// 3. Company isolation
if (expense.companyId !== user.companyId) {
  return res.status(404);
}
```

### Frontend Validation:
```typescript
// Mandatory comment prompt
const comment = window.prompt("Provide a reason...");
if (!comment || comment.trim().length === 0) {
  toast.error("A comment is required for admin overrides");
  return;
}
```

---

## Comparison: Normal Approval vs Admin Override

| Aspect | Normal Approval | Admin Override |
|--------|----------------|----------------|
| **Who can use** | Assigned approvers only | Admins only |
| **Timing** | Must wait for their turn | Instant, any time |
| **Workflow** | Follows sequence | Bypasses all rules |
| **Comment** | Optional | **Required** |
| **Audit trail** | Standard approval | Flagged as override |
| **Use case** | Regular operations | Emergency/special cases |

---

## Usage Examples

### Example 1: Emergency Approval
```
Scenario: CEO needs urgent expense approved for client meeting

1. Admin goes to Admin Dashboard
2. Finds expense in "All Expenses" table
3. Clicks "Override Approve"
4. Enters: "Urgent: CEO client presentation"
5. Expense instantly approved
6. Employee notified, can proceed with reimbursement
```

### Example 2: Policy Violation Rejection
```
Scenario: Expense violates company policy but stuck in approval

1. Admin identifies problematic expense
2. Clicks "Override Reject"
3. Enters: "Violates travel policy - personal expense"
4. Expense instantly rejected
5. Stops further processing immediately
```

---

## API Documentation

### Override Expense
```http
POST /api/expenses/:id/override
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "decision": "APPROVED",
  "comment": "Reason for override"
}
```

**Success Response (200):**
```json
{
  "id": "expense-id",
  "status": "APPROVED",
  "overriddenBy": "admin-user-id",
  "overriddenAt": "2025-10-04T12:00:00.000Z",
  ...
}
```

**Error Responses:**
- `400` - Invalid payload or missing comment
- `403` - Not an admin
- `404` - Expense not found or wrong company

---

## Benefits

✅ **Emergency Control** - Handle urgent situations instantly  
✅ **Policy Enforcement** - Reject policy violations immediately  
✅ **Dispute Resolution** - Resolve stuck or disputed expenses  
✅ **Full Accountability** - Complete audit trail with required comments  
✅ **User Experience** - Clean UI with clear override actions  
✅ **Security** - Role-based access and validation  

---

## Implementation Files

### Backend:
- `server/routes/expenses.ts` - Added `adminOverride` handler
- `server/index.ts` - Registered override route
- `shared/api.ts` - Updated types and interfaces

### Frontend:
- `client/pages/admin/AdminDashboard.tsx` - Added expenses table and override UI
- `shared/api.ts` - Type-safe API contracts

---

## Testing Checklist

- [ ] Admin can override pending expenses
- [ ] Non-admins get 403 error
- [ ] Comment validation works (required)
- [ ] Override creates audit trail entry
- [ ] Expense status changes instantly
- [ ] `overriddenBy` and `overriddenAt` populated
- [ ] UI updates after override
- [ ] Toast notifications work
- [ ] Cross-company access blocked
- [ ] Already processed expenses show correct message

---

## Future Enhancements

Potential improvements:
1. **Override History View** - Dedicated page showing all overrides
2. **Bulk Override** - Select multiple expenses to override at once
3. **Override Notifications** - Email alerts when admin overrides
4. **Override Analytics** - Dashboard showing override patterns
5. **Approval Restoration** - Allow admins to "undo" overrides
6. **Rich Comment Editor** - Better UI for override comments

---

## Conclusion

The admin override feature provides complete administrative control over expense approvals while maintaining full accountability through required comments and comprehensive audit trails. This fulfills the permission requirement: **"Admin can override approvals"**.


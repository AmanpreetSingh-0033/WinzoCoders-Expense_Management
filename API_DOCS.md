# API Documentation - Expence Flow

Complete API reference for the Expence Flow expense management system.

## Base URL

```
http://localhost:8080/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### POST /auth/signup

Create a new company and admin user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "admin@company.com",
  "password": "securepassword",
  "companyName": "Acme Inc",
  "country": "United States"
}
```

**Response (201):**
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

**Notes:**
- First signup creates the company and admin user
- Currency is auto-detected from country using REST Countries API
- Demo users (manager, employee) are automatically created

---

### POST /auth/login

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* user object */ },
  "company": { /* company object */ }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `400` - Invalid payload

---

### GET /me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
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
    "rules": { /* workflow rules */ }
  }
}
```

---

## User Management Endpoints

### GET /users

List all users in the company.

**Permissions:** Admin, Finance, Director, CFO

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "admin@company.com",
    "role": "ADMIN",
    "companyId": "uuid",
    "managerId": null
  },
  {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@company.com",
    "role": "EMPLOYEE",
    "companyId": "uuid",
    "managerId": "manager-uuid"
  }
]
```

---

### GET /users/:id

Get details of a specific user.

**Permissions:** Admin, Finance, Director, CFO, or own profile

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "role": "EMPLOYEE",
  "companyId": "uuid",
  "managerId": "manager-uuid"
}
```

---

### POST /users

Create a new user.

**Permissions:** Admin only

**Request Body:**
```json
{
  "name": "New Employee",
  "email": "employee@company.com",
  "password": "password123",
  "role": "EMPLOYEE",
  "managerId": "manager-uuid" // optional
}
```

**Roles:** `ADMIN`, `MANAGER`, `EMPLOYEE`, `FINANCE`, `DIRECTOR`, `CFO`

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Employee",
  "email": "employee@company.com",
  "role": "EMPLOYEE",
  "companyId": "uuid",
  "managerId": "manager-uuid"
}
```

**Error Responses:**
- `403` - Not authorized (non-admin)
- `409` - Email already registered
- `400` - Invalid manager ID or payload

---

### PUT /users/:id

Update an existing user.

**Permissions:** Admin only

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "MANAGER",
  "managerId": "new-manager-uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "email": "employee@company.com",
  "role": "MANAGER",
  "companyId": "uuid",
  "managerId": "new-manager-uuid"
}
```

---

### DELETE /users/:id

Delete a user.

**Permissions:** Admin only

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `400` - Cannot delete yourself
- `404` - User not found

---

## Expense Endpoints

### GET /expenses

List expenses (filtered by role).

**Headers:**
```
Authorization: Bearer <token>
```

**Role-based filtering:**
- **Admin/Finance/Director/CFO**: See all company expenses
- **Manager**: See expenses where they are an approver or from their team
- **Employee**: See only their own expenses

**Response (200):**
```json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "companyId": "uuid",
    "amount": 120.50,
    "currency": "EUR",
    "convertedAmount": 130.25,
    "convertedCurrency": "USD",
    "category": "Meals",
    "description": "Team lunch",
    "date": "2025-10-04",
    "receiptUrl": "/uploads/receipt-uuid.jpg",
    "status": "PENDING",
    "approvals": [
      {
        "expenseId": "uuid",
        "approverId": "manager-uuid",
        "decision": "PENDING",
        "comment": null,
        "decidedAt": null
      }
    ],
    "approverSequence": ["manager-uuid", "finance-uuid"],
    "currentApproverIndex": 0
  }
]
```

---

### POST /expenses

Submit a new expense.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
amount: 120.50
currency: EUR
category: Meals
description: Team lunch
date: 2025-10-04
receipt: [file] (optional)
```

**Response (201):**
```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "companyId": "uuid",
  "amount": 120.50,
  "currency": "EUR",
  "convertedAmount": 130.25,
  "convertedCurrency": "USD",
  "category": "Meals",
  "description": "Team lunch",
  "date": "2025-10-04",
  "receiptUrl": "/uploads/receipt-uuid.jpg",
  "status": "PENDING",
  "approvals": [ /* approval chain */ ],
  "approverSequence": ["manager-uuid", "finance-uuid"],
  "currentApproverIndex": 0
}
```

**Notes:**
- Currency is automatically converted to company base currency
- Approval sequence is auto-generated: Manager → Finance → Director
- Receipt file size limit: 5MB
- Allowed file types: JPEG, PNG, GIF, PDF

---

### POST /expenses/:id/decision

Approve or reject an expense.

**Permissions:** Must be the current approver in the sequence

**Request Body:**
```json
{
  "decision": "APPROVED",
  "comment": "Looks good" // optional
}
```

**Decision values:** `APPROVED`, `REJECTED`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "APPROVED", // or "PENDING" if more approvals needed
  /* ... full expense object ... */
}
```

**Workflow Logic:**
- If rejected: Expense status becomes "REJECTED"
- If approved: Checks workflow rules
  - **Percentage rule**: If X% approved, expense is approved
  - **CFO override**: If CFO approves and override enabled, auto-approve
  - **Hybrid**: Either condition triggers approval
- Moves to next approver if more approvals needed

**Error Responses:**
- `403` - Not your turn to approve
- `404` - Expense not found

---

## Workflow Endpoints

### GET /workflows

Get company workflow rules.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "percentage": 0.6,
  "cfoOverride": true,
  "hybrid": true
}
```

---

### PUT /workflows

Update workflow rules.

**Permissions:** Admin only

**Request Body:**
```json
{
  "percentage": 0.75,
  "cfoOverride": false,
  "hybrid": true
}
```

**Response (200):**
```json
{
  "percentage": 0.75,
  "cfoOverride": false,
  "hybrid": true
}
```

**Rules Explanation:**
- **percentage** (0-1): Fraction of approvers that must approve
- **cfoOverride** (boolean): CFO approval auto-approves
- **hybrid** (boolean): Use percentage OR CFO override

---

## Reference Data Endpoints

### GET /countries

Get list of countries with currencies.

**No authentication required**

**Response (200):**
```json
[
  {
    "name": {
      "common": "United States"
    },
    "currencies": {
      "USD": {
        "name": "United States dollar",
        "symbol": "$"
      }
    }
  },
  {
    "name": {
      "common": "United Kingdom"
    },
    "currencies": {
      "GBP": {
        "name": "British pound",
        "symbol": "£"
      }
    }
  }
]
```

**Source:** REST Countries API (https://restcountries.com)

---

### GET /rates/:base

Get exchange rates for a base currency.

**No authentication required**

**Example:** `/api/rates/USD`

**Response (200):**
```json
{
  "base": "USD",
  "date": "2025-10-04",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "JPY": 110.25,
    "CAD": 1.25
  }
}
```

**Source:** Exchange Rate API (https://api.exchangerate-api.com)

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Invalid payload",
  "errors": [ /* validation errors */ ]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "message": "Not found"
}
```

### 409 Conflict
```json
{
  "message": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production deployments.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## File Uploads

**Endpoint:** `/api/expenses` (POST with multipart/form-data)

**Limits:**
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/gif, application/pdf
- Storage: `server/uploads/` directory

**Access uploaded files:**
```
http://localhost:8080/uploads/<filename>
```

---

## Webhooks (Future)

Webhook support for expense events is planned for future releases:
- `expense.created`
- `expense.approved`
- `expense.rejected`
- `user.created`

---

## SDK / Client Libraries

Currently no official SDKs. Use standard HTTP clients:

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const expenses = await response.json();
```

**cURL:**
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/api/expenses
```

---

## Support

For API questions or issues:
- Check this documentation
- Review the source code in `server/routes/`
- Open an issue on GitHub

---

**Last Updated:** 2025-10-04
**API Version:** 1.0.0

# Quick Start Guide - Expence Flow

Get your expense management system running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- pnpm package manager (`npm install -g pnpm`)

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Configure Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE expense_db;
```

2. Update `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_db?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=8080
```

## Step 3: Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

## Step 4: Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:8080` in your browser.

## Step 5: Create Your Company

1. Click "Get Started" on the homepage
2. Fill in the signup form:
   - **Your Name**: John Doe
   - **Company Name**: Acme Inc
   - **Email**: admin@acme.com
   - **Password**: (choose a secure password)
   - **Country**: United States (currency auto-detected)
3. Click "Create my company"

You're now logged in as an Admin! 🎉

## What's Next?

### Add Team Members
1. Go to Dashboard → Admin tab
2. Click "Add User" button
3. Create employees, managers, and other roles

### Configure Approval Workflow
1. In Admin Dashboard, click "Edit Rules"
2. Set approval percentage (e.g., 0.6 for 60%)
3. Enable/disable CFO override and hybrid mode

### Submit Your First Expense
1. Switch to Employee tab
2. Fill in expense details
3. Upload a receipt (optional)
4. Click "Submit expense"

### Approve Expenses (Manager/Admin)
1. Go to Manager tab
2. Review pending expenses
3. Click "Approve" or "Reject"

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 3000)
- Or stop the process using port 8080

### Module Not Found Errors
- Run `pnpm install` again
- Delete `node_modules` and `pnpm-lock.yaml`, then reinstall

## Demo Credentials

After signup, the system automatically creates demo users:

- **Manager**: manager@example.com
- **Employee**: employee@example.com
- Password: (same as admin password you set)

## Production Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review API endpoints and features
- Open an issue if you encounter problems

---

Happy expense tracking! 🚀

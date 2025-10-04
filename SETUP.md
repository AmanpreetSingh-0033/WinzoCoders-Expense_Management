# Setup Instructions

## Complete Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- React 18 + TypeScript
- Express + Node.js dependencies
- Prisma ORM
- bcrypt for password hashing
- multer for file uploads
- JWT for authentication
- Recharts for data visualization
- shadcn/ui components

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL if not already installed
2. Create a database:
```sql
CREATE DATABASE expense_db;
```

3. Update `.env` with your credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_db?schema=public"
```

#### Option B: Cloud Database (Recommended for Production)

Use services like:
- **Supabase** (Free tier available)
- **Railway** (PostgreSQL hosting)
- **Heroku Postgres**
- **AWS RDS**
- **Digital Ocean Managed Databases**

Example Supabase connection string:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_db?schema=public"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Port
PORT=8080
```

**Generate a secure JWT secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Initialize Database Schema

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# OR run migrations (production)
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at: `http://localhost:8080`

### 6. Create Your First Company

1. Navigate to `http://localhost:8080`
2. Click "Get Started"
3. Fill in the signup form
4. Your company and admin account will be created automatically

## Verification Steps

### Check Database Connection
```bash
pnpm db:studio
```
This opens Prisma Studio to view your database.

### Check TypeScript Compilation
```bash
pnpm typecheck
```

### Run Tests (if available)
```bash
pnpm test
```

## Troubleshooting

### Issue: "Cannot find module 'bcrypt'"
**Solution:** Rebuild bcrypt for your platform
```bash
pnpm rebuild bcrypt
```

### Issue: "Port 8080 already in use"
**Solution:** Change port in `.env`
```env
PORT=3000
```

### Issue: "Database connection failed"
**Solutions:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Ensure database exists
4. Check firewall settings

### Issue: Prisma Client errors
**Solution:** Regenerate Prisma Client
```bash
pnpm db:generate
```

### Issue: TypeScript errors
**Solution:** These are expected until dependencies are installed. Run:
```bash
pnpm install
```

## Production Deployment

### Build the Application
```bash
pnpm build
```

### Set Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-production-secret"
PORT=8080
```

### Run Migrations
```bash
pnpm db:migrate
```

### Start Production Server
```bash
pnpm start
```

## Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm db:generate
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: expense_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/expense_db
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with Docker:
```bash
docker-compose up
```

## Cloud Deployment Options

### Vercel (Frontend + Serverless Functions)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Configure environment variables in Vercel dashboard

### Railway (Full-Stack)
1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy automatically on push

### Heroku
1. Create app: `heroku create`
2. Add PostgreSQL: `heroku addons:create heroku-postgresql`
3. Set config vars: `heroku config:set JWT_SECRET=...`
4. Deploy: `git push heroku main`

### AWS (EC2 + RDS)
1. Launch EC2 instance
2. Create RDS PostgreSQL database
3. Configure security groups
4. Deploy application
5. Use PM2 for process management

## Performance Optimization

### Enable Caching
Consider adding Redis for:
- Session storage
- API response caching
- Rate limiting

### Database Optimization
- Add indexes to frequently queried fields
- Use connection pooling
- Enable query logging in development

### Frontend Optimization
- Lazy load routes
- Optimize images
- Enable compression
- Use CDN for static assets

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Enable CORS restrictions
- [ ] Add rate limiting
- [ ] Implement CSP headers
- [ ] Regular security updates
- [ ] Database backups
- [ ] Input validation
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection

## Monitoring & Logging

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Datadog** for APM
- **Winston** for structured logging

## Backup Strategy

### Database Backups
```bash
# PostgreSQL backup
pg_dump -U username expense_db > backup.sql

# Restore
psql -U username expense_db < backup.sql
```

### Automated Backups
- Use cloud provider backup features
- Schedule daily backups
- Test restore procedures regularly

## Support

For issues during setup:
1. Check [QUICKSTART.md](./QUICKSTART.md)
2. Review [README.md](./README.md)
3. Check [API_DOCS.md](./API_DOCS.md)
4. Open a GitHub issue

---

**Setup Complete!** 🎉

Your expense management system is ready to use.

# Deployment Guide - TrackIt

This guide will walk you through deploying the TrackIt application to Vercel with a DigitalOcean PostgreSQL database.

## Table of Contents

- [Prerequisites](#prerequisites)
- [DigitalOcean Database Setup](#digitalocean-database-setup)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, make sure you have:

- ✅ A Vercel account ([sign up free](https://vercel.com/signup))
- ✅ A DigitalOcean account with a Managed PostgreSQL Database
- ✅ Git repository containing the TrackIt code (GitHub, GitLab, or Bitbucket)
- ✅ Node.js 18.x or higher installed locally
- ✅ DigitalOcean database connection string (you already have this)

## DigitalOcean Database Setup

### Verify Database Configuration

Your DigitalOcean PostgreSQL database is already configured with:
- **Host**: `db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com`
- **Port**: `25060`
- **Database**: `defaultdb`
- **Username**: `doadmin`
- **SSL Mode**: `require`

### Enable Trusted Sources (Optional but Recommended)

1. Log into [DigitalOcean Control Panel](https://cloud.digitalocean.com/)
2. Navigate to **Databases** → Select your database cluster
3. Go to **Settings** → **Trusted Sources**
4. Add Vercel's IP ranges to allow connections:
   - Add Vercel's public IPs (can be found in Vercel dashboard under Settings → Environment Variables)
   - Or allow your local machine's IP for testing

### Create Connection String

Your connection string should look like this:
```
postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require&pgbouncer=true
```

**Important Notes:**
- `pgbouncer=true` is recommended for connection pooling
- `sslmode=require` is required for secure connections
- Keep your password secure - never commit it to version control

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push Code to Git Repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Project**
   - Select your Git repository
   - Click **Import**

3. **Configure Build Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (see next section)

5. **Deploy**
   - Click **Deploy**
   - Wait for the build to complete (~2-3 minutes)
   - Your site will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   cd book_tracking
   vercel
   ```

4. **Follow the Prompts**
   - Set up and deploy to Vercel
   - Configure environment variables when asked
   - Answer yes to all prompts

## Environment Variables

### Required Environment Variables

Set these in Vercel Dashboard: **Settings** → **Environment Variables**

#### 1. Database URL
```
DATABASE_URL=postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require&pgbouncer=true
```

#### 2. NextAuth URL
```
NEXTAUTH_URL=https://your-project-name.vercel.app
```
Replace with your actual Vercel URL.

#### 3. NextAuth Secret
Generate a secure secret:
```bash
openssl rand -base64 32
```
Then add:
```
NEXTAUTH_SECRET=your-generated-secret-here
```

#### 4. Node Environment
```
NODE_ENV=production
```

### Adding Environment Variables in Vercel Dashboard

1. Go to your Vercel project
2. Click **Settings** tab
3. Click **Environment Variables**
4. Add each variable:
   - Key: `DATABASE_URL`
   - Value: (paste your connection string)
   - Select all environments (Production, Preview, Development)
5. Repeat for all variables
6. **Important**: After adding variables, you must redeploy for changes to take effect

### Testing Environment Variables Locally

Create a `.env.local` file locally with the same variables:
```env
DATABASE_URL=postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require&pgbouncer=true
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret-for-development
NODE_ENV=development
```

## Database Migration

### Prerequisites

Make sure you have `prisma` installed locally:
```bash
npm install -g prisma
```

### Option 1: Run Migration from Local Machine

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Push Schema to Database**
   ```bash
   npx prisma db push
   ```

3. **Run Migrations (Production)**
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: Run Migration via Vercel CLI

1. **Set Up Remote Execution**
   ```bash
   vercel env pull .env.local
   ```

2. **Generate and Apply Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Option 3: Automatic Migration (Recommended for Production)

Vercel can automatically run migrations on deployment:

1. **Update `vercel.json`** (already included in your project):
   ```json
   {
     "buildCommand": "prisma generate && prisma migrate deploy && next build",
     "installCommand": "npm install && npx prisma generate"
   }
   ```

2. **Redeploy** your project in Vercel dashboard

### Seed Database (Optional)

To populate your database with sample data:

1. **Install ts-node**
   ```bash
   npm install -D ts-node
   ```

2. **Run Seed Script**
   ```bash
   npm run seed
   ```

Or using ts-node directly:
```bash
npx ts-node prisma/seed.ts
```

## Post-Deployment Steps

### 1. Verify Database Connection

Check if your app can connect to the database:

1. Open your deployed site
2. Try adding a new tracking item
3. If successful, your database connection is working

### 2. Test API Endpoints

Test your API endpoints using tools like Postman or curl:

```bash
# Get all tracking items
curl https://your-project-name.vercel.app/api/tracking?userId=test-user-id

# Add new tracking item
curl -X POST https://your-project-name.vercel.app/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Item",
    "category": "MOVIE",
    "description": "Test description"
  }'
```

### 3. Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### 4. Configure Analytics (Optional)

Enable Vercel Analytics:

1. Go to **Analytics** tab
2. Click **Enable Analytics**
3. Install the package:
   ```bash
   npm install @vercel/analytics
   ```

4. Add to your layout:
   ```tsx
   import { Analytics } from '@vercel/analytics/react'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

### 5. Monitor Application

Set up monitoring and alerts:

- **Vercel Logs**: View in Vercel Dashboard → Your Project → Logs
- **Error Tracking**: Consider integrating Sentry or similar tools
- **Uptime Monitoring**: Use UptimeRobot or similar services

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms:**
- "Prisma Client could not locate the Prisma schema file"
- "Connection refused"
- Timeout errors

**Solutions:**
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check DigitalOcean trusted sources include Vercel IPs
3. Ensure `sslmode=require` is in connection string
4. Test connection locally with `npx prisma studio`

### Issue: Build Fails

**Symptoms:**
- Build fails during deployment
- TypeScript errors
- Missing dependencies

**Solutions:**
1. Check build logs in Vercel Dashboard
2. Run `npm run build` locally to reproduce
3. Clear Next.js cache: `rm -rf .next`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

### Issue: Prisma Client Not Generated

**Symptoms:**
- "PrismaClient is not generated"
- Module not found errors

**Solutions:**
1. Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
2. Manually generate: `npx prisma generate`
3. Check `@prisma/client` is in dependencies (not devDependencies)

### Issue: Migrations Not Running

**Symptoms:**
- Database tables not created
- API returns errors

**Solutions:**
1. Run `npx prisma migrate deploy` locally
2. Check migration logs in Vercel Dashboard
3. Verify `prisma/migrations` directory exists and has migrations

### Issue: Environment Variables Not Working

**Symptoms:**
- App can't access database
- Configuration not applied

**Solutions:**
1. Redeploy after adding environment variables
2. Check variable names (case-sensitive)
3. Verify values don't have extra spaces
4. Use `vercel env pull .env.local` to verify

### Issue: Edge Function Errors

**Symptoms:**
- API routes returning 500 errors
- Timeout on Vercel Edge Functions

**Solutions:**
1. Check `vercel.json` has correct function runtime configuration
2. Ensure API routes export `export const runtime = 'edge'`
3. Review Edge Function limits (1MB memory, 10s execution)
4. Check Vercel logs for specific error messages

### Issue: Slow Performance

**Symptoms:**
- Slow page loads
- API timeouts

**Solutions:**
1. Enable `pgbouncer=true` in DATABASE_URL for connection pooling
2. Add database indexes (see schema.prisma)
3. Use Prisma's `select` to reduce data fetching
4. Implement caching strategies
5. Consider upgrading DigitalOcean database plan

## Monitoring and Maintenance

### Regular Tasks

1. **Monitor Database Size**
   ```bash
   npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size('defaultdb'));"
   ```

2. **Check Query Performance**
   - Use Prisma Studio: `npx prisma studio`
   - Review DigitalOcean database metrics

3. **Update Dependencies**
   ```bash
   npm update
   npm outdated
   ```

4. **Backup Database**
   - DigitalOcean automatically backups
   - Export data manually if needed:
     ```bash
     pg_dump "postgresql://doadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require" > backup.sql
     ```

## Production Checklist

- [ ] Database connection verified
- [ ] Environment variables configured
- [ ] Migrations deployed
- [ ] API endpoints tested
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)
- [ ] Error monitoring configured (optional)
- [ ] Database backups verified
- [ ] Performance tested
- [ ] Security review completed

## Support

If you encounter issues not covered here:

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Prisma Documentation](https://www.prisma.io/docs)
- Visit [DigitalOcean PostgreSQL Docs](https://docs.digitalocean.com/products/databases/postgresql/)
- Open an issue in the project repository

## Additional Resources

- [Vercel Next.js Deployment Guide](https://vercel.com/docs/frameworks/nextjs)
- [Prisma Production Checklist](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/production-checklist)
- [DigitalOcean PostgreSQL Best Practices](https://docs.digitalocean.com/products/databases/postgresql/best-practices/)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)

---

**Deployment successful! 🎉**

Your TrackIt application is now live on Vercel with a DigitalOcean PostgreSQL database.
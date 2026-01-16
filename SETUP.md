# Setup Guide - TrackIt

This guide will walk you through setting up the TrackIt application on your local machine for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Installation](#project-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Development Server](#running-the-development-server)
- [Testing the Application](#testing-the-application)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

- **Node.js** (version 18.x or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version` (should be >= 18.0.0)
  
- **npm** or **yarn** (package manager)
  - npm comes with Node.js
  - Verify: `npm --version` or `yarn --version`

- **Git** (version control)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

### Database Access

- **DigitalOcean Managed PostgreSQL Database**
  - You already have the database credentials
  - Ensure you have network access to the database
  - Database: `defaultdb`
  - Host: `db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com`
  - Port: `25060`

### Recommended Tools

- **VS Code** (code editor)
  - Recommended extensions:
    - Prisma
    - Tailwind CSS IntelliSense
    - ESLint
    - Prettier

- **Postman** or similar (API testing)
  - For testing API endpoints

## Project Installation

### 1. Clone the Repository

If you have the project files locally, skip to step 2.

```bash
# Clone the repository
git clone <your-repository-url>
cd book_tracking
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install all required packages including:
- Next.js (framework)
- React (UI library)
- Prisma (database ORM)
- Tailwind CSS (styling)
- shadcn/ui (UI components)
- And many more...

**Installation typically takes 2-5 minutes depending on your internet speed.**

### 3. Verify Installation

Check that all dependencies are installed correctly:

```bash
# Check package.json exists
cat package.json

# Verify node_modules directory exists
ls -la node_modules

# Check if key packages are installed
npm list next
npm list @prisma/client
npm list react
```

## Environment Configuration

### 1. Create Environment File

The project comes with a `.env.local` file template. Create your own:

```bash
# Copy the template if it exists
cp .env.local.example .env.local

# If no template exists, create the file manually
touch .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` and add the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require&pgbouncer=true"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_32"

# App Environment
NODE_ENV="development"
```

### 3. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[System.Web.Security.Membership]::GeneratePassword(32, 0)
```

Replace `CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_32` with your generated secret.

### 4. Verify Environment Variables

Ensure no trailing spaces or special characters:

```bash
# View the file contents
cat .env.local

# Or on Windows
type .env.local
```

## Database Setup

### 1. Install Prisma CLI

If not already installed globally:

```bash
npm install -g prisma
```

### 2. Generate Prisma Client

This generates the TypeScript client based on your schema:

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
```

### 3. Set Up Database Schema

You have two options:

#### Option A: Push Schema (Recommended for Development)

This pushes the schema directly to the database:

```bash
npx prisma db push
```

**Expected Output:**
```
✔ Loaded env from `.env`
✔ Connected to database
✔ Introspected 5 models and wrote 5 migrations
✔ Generated Prisma Client
```

#### Option B: Create Migrations (Better for Production)

```bash
npx prisma migrate dev --name init
```

**Expected Output:**
```
✔ Enter a name for the new migration: init
✔ Applying migration `init`
✔ Created 5 migration files and 1 seed file
✔ Generated Prisma Client
```

### 4. Verify Database Connection

Test that you can connect to the database:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser at `http://localhost:5555`. You should see:
- User model
- TrackingItem model
- UserTracking model
- TrackingNote model
- ActivityLog model

Press `Ctrl+C` to close Prisma Studio.

### 5. Seed Database (Optional)

To populate your database with sample data:

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run the seed script
npm run seed
```

Or directly:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

**Expected Output:**
```
🌱 Starting database seed...
✅ Created user: demo@trackit.com
✅ Created tracking item: Attack on Titan (ANIME)
  └─ Created user tracking: WATCHING, rating: 8
... (more items)
✨ Seed completed successfully!
```

### 6. Verify Seeded Data

```bash
npx prisma studio
```

Check that tables now contain data.

## Running the Development Server

### 1. Start the Development Server

```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

### 2. Open the Application

Open your browser and navigate to:
- **Application URL**: `http://localhost:3000`
- **Prisma Studio**: `http://localhost:5555` (if running)

### 3. Verify the Application

You should see:
- TrackIt branding and header
- "Add New Item" button
- Category tabs (All, Anime, Manga, Movies, etc.)
- Statistics cards showing:
  - Total Items
  - Watching/Reading count
  - Completed count
  - Favorites count
- Empty state prompting to add items

## Testing the Application

### 1. Test Adding a Tracking Item

1. Click the "Add New Item" button
2. Fill in the form:
   - Title: "My First Anime"
   - Category: "Anime"
   - Description: "Test description"
   - Author: "Test Author"
   - Year: 2024
   - Genres: "Action, Adventure"
   - Total Episodes: 24
3. Click "Add Item"

**Expected Result:**
- Modal closes
- New item appears in the list
- Statistics update

### 2. Test Status Updates

1. On any item card, use the status dropdown
2. Change status to "Watching"
3. Verify the status badge updates

**Expected Result:**
- Status badge changes color and text
- Progress bar appears

### 3. Test Rating System

1. Use the rating dropdown on an item
2. Select a rating (e.g., "8/10")
3. Verify stars appear

**Expected Result:**
- Star rating displays correctly
- Yellow stars up to rating
- Gray stars after rating

### 4. Test Filtering

1. Click different category tabs
2. Use the search bar to filter by title
3. Click "Favorites Only" button
4. Filter by status

**Expected Result:**
- Grid updates to show filtered items
- Statistics remain accurate

### 5. Test API Endpoints

Use Postman or curl to test API:

```bash
# Get all tracking items
curl "http://localhost:3000/api/tracking?userId=test-user-id"

# Add new item
curl -X POST http://localhost:3000/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Item",
    "category": "MOVIE",
    "description": "Test description"
  }'

# Update item status
curl -X PUT http://localhost:3000/api/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "itemId": "item-id-here",
    "status": "WATCHING"
  }'

# Delete item
curl -X DELETE "http://localhost:3000/api/tracking?userId=test-user-id&itemId=item-id-here"
```

## Development Workflow

### 1. Project Structure

```
book_tracking/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/         # API routes (Edge Functions)
│   │   ├── page.tsx     # Main dashboard
│   │   └── globals.css  # Global styles
│   ├── components/      # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utility functions
│       ├── prisma.ts    # Prisma client
│       └── utils.ts     # Helper functions
├── prisma/              # Database files
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── public/              # Static assets
└── [config files]       # Various config files
```

### 2. Common Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Database
npm run prisma:generate # Generate Prisma Client
npm run prisma:push     # Push schema to database
npm run prisma:migrate  # Create migration
npm run prisma:studio   # Open Prisma Studio
npm run prisma:reset    # Reset database (⚠️ deletes data)
npm run seed            # Seed database with sample data

# Prisma Direct
npx prisma db push      # Alternative to push schema
npx prisma migrate deploy # Deploy migrations (production)
npx prisma studio       # Alternative to open studio
```

### 3. Code Quality

#### Run Linting

```bash
npm run lint
```

Fix linting errors automatically:

```bash
npm run lint -- --fix
```

#### Format Code

Install Prettier:

```bash
npm install -D prettier
```

Format all files:

```bash
npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"
```

### 4. Adding New Features

#### Add New Component

```bash
# Create component file
touch src/components/my-component.tsx
```

Example component:

```tsx
export default function MyComponent() {
  return <div>Hello World</div>
}
```

#### Add New API Route

```bash
# Create API route directory
mkdir -p src/app/api/my-endpoint

# Create route file
touch src/app/api/my-endpoint/route.ts
```

Example API route:

```tsx
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
```

#### Add New Database Model

1. Edit `prisma/schema.prisma`:

```prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

2. Push changes to database:

```bash
npx prisma db push
```

3. Regenerate Prisma Client:

```bash
npx prisma generate
```

### 5. Git Workflow

```bash
# Stage changes
git add .

# Commit changes
git commit -m "feat: add new tracking feature"

# Push to remote
git push origin main

# Create new branch for features
git checkout -b feature/new-feature
```

### 6. Testing Before Deployment

```bash
# 1. Build the project
npm run build

# 2. Test production build locally
npm start

# 3. Check for any errors in browser console
# 4. Test all main features
# 5. Verify database operations
```

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
# On macOS/Linux
lsof -ti:3000

# On Windows
netstat -ano | findstr :3000

# Kill the process
# On macOS/Linux
kill -9 <PID>

# On Windows
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Database Connection Failed

**Error:**
```
PrismaClientInitializationError: Error connecting to the database
```

**Solutions:**

1. Verify DATABASE_URL in `.env.local`:
```bash
cat .env.local | grep DATABASE_URL
```

2. Test database connection:
```bash
npx prisma db push
```

3. Check network connectivity:
```bash
ping db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com
```

4. Verify SSL mode is set to `require`:
```
?sslmode=require
```

### Issue: Prisma Client Not Generated

**Error:**
```
Error: Prisma Client is not generated
```

**Solution:**

```bash
# Generate Prisma Client
npx prisma generate

# If that fails, reinstall dependencies
rm -rf node_modules
npm install
npx prisma generate
```

### Issue: TypeScript Errors

**Error:**
```
TypeScript error: Cannot find module
```

**Solution:**

```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -rf node_modules/.cache

# Regenerate Prisma Client
npx prisma generate

# Restart development server
npm run dev
```

### Issue: Module Not Found

**Error:**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**

1. Verify `tsconfig.json` has correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. Restart TypeScript server in VS Code:
   - Command Palette (Ctrl+Shift+P)
   - Type "TypeScript: Restart TS Server"

### Issue: Build Fails

**Error:**
```
Build failed with errors
```

**Solution:**

```bash
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Generate Prisma Client
npx prisma generate

# Try building again
npm run build
```

### Issue: Environment Variables Not Loading

**Error:**
```
process.env.DATABASE_URL is undefined
```

**Solution:**

1. Verify `.env.local` exists:
```bash
ls -la .env.local
```

2. Check file contents:
```bash
cat .env.local
```

3. Ensure no syntax errors (no trailing spaces)
4. Restart development server:
```bash
# Ctrl+C to stop
npm run dev
```

### Issue: Seed Script Fails

**Error:**
```
Error: Command failed: ts-node
```

**Solution:**

```bash
# Install ts-node
npm install -D ts-node

# Ensure types are installed
npm install -D @types/node @types/bcryptjs

# Run seed with explicit compiler options
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Issue: Edge Function Timeout

**Error:**
```
Edge function timeout
```

**Solution:**

1. Edge Functions have a 10-second timeout limit
2. Optimize database queries:
```typescript
// Instead of fetching all data
const all = await prisma.trackingItem.findMany()

// Use select to reduce payload
const items = await prisma.trackingItem.findMany({
  select: {
    id: true,
    title: true,
    category: true,
  }
})
```

3. Add database indexes in `schema.prisma`:
```prisma
model User {
  email String @unique
  @@index([email])
}
```

### Getting Help

If you encounter issues not covered here:

1. Check the logs in your terminal
2. Check browser console for errors
3. Review the documentation:
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Prisma Documentation](https://www.prisma.io/docs)
   - [DigitalOcean PostgreSQL](https://docs.digitalocean.com/products/databases/postgresql/)
4. Search for similar issues on GitHub
5. Open an issue in the project repository

## Next Steps

After completing the setup:

1. **Explore the Codebase**: Read through the project structure and understand the architecture
2. **Customize the UI**: Modify colors, components, and layouts to your preference
3. **Add Authentication**: Implement NextAuth.js for user authentication
4. **Deploy to Production**: Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide
5. **Contribute**: Add new features, fix bugs, and improve the application

## Additional Resources

- [Next.js Getting Started](https://nextjs.org/docs/getting-started)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Setup Complete! 🎉**

Your TrackIt application is now ready for development. Start building awesome tracking features!
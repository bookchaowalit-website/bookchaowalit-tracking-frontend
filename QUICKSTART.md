# Quick Start Guide - TrackIt

Get TrackIt up and running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- DigitalOcean PostgreSQL database access (already configured)

## 1. Install Dependencies

```bash
cd book_tracking
npm install
```

## 2. Configure Environment

Create `.env.local` file with your database credentials:

```env
DATABASE_URL="postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require&pgbouncer=true"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
NODE_ENV="development"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

## 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data (optional but recommended)
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Test It Out

1. Click **"Add New Item"**
2. Fill in the form with any anime, manga, movie, book, etc.
3. Click **"Add Item"**
4. Explore the dashboard with filtering and tracking features!

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run lint            # Check code quality

# Database
npx prisma studio       # Open database GUI
npm run seed            # Seed sample data
npx prisma db push      # Update database schema
```

## Quick Troubleshooting

**Database connection failed?**
- Verify `.env.local` has correct `DATABASE_URL`
- Check that you have internet access
- Ensure SSL mode is set to `require`

**Port 3000 already in use?**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Prisma client not generated?**
```bash
npx prisma generate
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup instructions
- Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to Vercel
- Check [README.md](README.md) for full documentation

## Features at a Glance

✅ Track 9+ content categories (Anime, Manga, Movies, Books, Games, etc.)
✅ Status management (Plan to Watch, Watching, Completed, etc.)
✅ 10-point rating system
✅ Progress tracking
✅ Favorites system
✅ Advanced filtering and search
✅ Beautiful, responsive UI
✅ Real-time statistics
✅ PostgreSQL database with Prisma ORM
✅ Ready for Vercel deployment

## Database Access

Open Prisma Studio to view and edit your data:
```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables and data
- Add/edit/delete records
- Test database operations
- Debug queries

---

**Need help?** Check the full documentation in [SETUP.md](SETUP.md) or [README.md](README.md).

**Ready to deploy?** Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide for Vercel.

Happy tracking! 🎉
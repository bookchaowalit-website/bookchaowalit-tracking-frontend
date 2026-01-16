# Project Structure Guide - TrackIt

This document provides a comprehensive overview of the TrackIt application's architecture, directory structure, and how different components interact with each other.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Core Directories](#core-directories)
- [Key Files](#key-files)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [API Routes](#api-routes)
- [Database Models](#database-models)
- [Styling Strategy](#styling-strategy)
- [Configuration Files](#configuration-files)

## Architecture Overview

TrackIt follows a **modern full-stack architecture** with the following characteristics:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   Tailwind   │  │   shadcn/ui  │      │
│  │   Components │  │   CSS Styles │  │   Components │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Edge)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │  REST API    │  │  Validation  │      │
│  │  App Router  │  │   Routes     │  │   (Zod)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Prisma     │  │  PostgreSQL  │  │   Digital    │      │
│  │     ORM      │  │   Database   │  │   Ocean      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Next.js App Router**: Modern React framework with server components and API routes
2. **Edge Functions**: API routes run on Vercel Edge for fast, globally distributed execution
3. **Prisma ORM**: Type-safe database access with automatic migrations
4. **PostgreSQL**: Robust relational database hosted on DigitalOcean
5. **shadcn/ui**: Customizable UI components built on Radix UI
6. **Tailwind CSS**: Utility-first CSS framework for rapid styling

## Directory Structure

```
book_tracking/
├── src/                          # Source code directory
│   ├── app/                     # Next.js App Router pages
│   │   ├── api/                 # API routes (Edge Functions)
│   │   │   └── tracking/        # Tracking-related endpoints
│   │   │       └── route.ts     # Main tracking API handler
│   │   ├── layout.tsx           # Root layout component
│   │   ├── page.tsx             # Main dashboard page
│   │   └── globals.css          # Global styles and theme
│   │
│   ├── components/              # React components
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx       # Button component
│   │       ├── card.tsx         # Card component
│   │       ├── input.tsx        # Input component
│   │       ├── select.tsx       # Select dropdown component
│   │       └── tabs.tsx         # Tabs component
│   │
│   └── lib/                     # Utility libraries
│       ├── prisma.ts            # Prisma client singleton
│       └── utils.ts             # Helper functions
│
├── prisma/                      # Database files
│   ├── schema.prisma            # Database schema definition
│   └── seed.ts                  # Database seeding script
│
├── public/                      # Static assets
│
├── Configuration Files          # Various config files
│   ├── package.json             # Dependencies and scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── next.config.js           # Next.js configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── vercel.json              # Vercel deployment config
│   └── .eslintrc.json           # ESLint configuration
│
└── Documentation Files
    ├── README.md                # Main project documentation
    ├── SETUP.md                 # Setup instructions
    ├── DEPLOYMENT.md            # Deployment guide
    ├── QUICKSTART.md            # Quick start guide
    ├── .env.local               # Environment variables (not committed)
    └── .gitignore               # Git ignore rules
```

## Core Directories

### `/src/app` - Next.js App Router

Contains all pages and API routes using Next.js 14's App Router architecture.

#### **Files**

- **`layout.tsx`**: Root layout wrapper for all pages
  - Applies global styles
  - Sets HTML metadata
  - Wraps content with providers (auth, theme, etc.)
  
- **`page.tsx`**: Main dashboard page (home route `/`)
  - Displays all tracking items
  - Handles filtering and search
  - Manages state for items, filters, and modals
  - Interacts with API endpoints
  
- **`globals.css`**: Global CSS styles
  - Tailwind directives
  - CSS custom properties (variables) for theming
  - Base styles and utility classes
  
#### **`/api` subdirectory** - API Routes

Contains REST API endpoints that run as Edge Functions on Vercel.

- **`tracking/route.ts`**: Main tracking API handler
  - `GET`: Retrieve tracking items with filtering
  - `POST`: Create new tracking item
  - `PUT`: Update existing tracking
  - `DELETE`: Remove tracking item
  - All operations support database queries via Prisma
  - Runs on Edge runtime for fast execution

### `/src/components` - React Components

Contains reusable React components organized by purpose.

#### **`/ui` subdirectory** - shadcn/ui Components

Pre-built, customizable UI components from shadcn/ui:

- **`button.tsx`**: Button with multiple variants (default, destructive, outline, etc.)
- **`card.tsx`**: Card container with header, content, and footer
- **`input.tsx`**: Form input with validation styles
- **`select.tsx`**: Dropdown select component
- **`tabs.tsx`**: Tab navigation for organizing content

Each component:
- Uses Radix UI primitives for accessibility
- Supports multiple variants and sizes
- Follows Tailwind CSS conventions
- Is fully type-safe with TypeScript

### `/src/lib` - Utility Libraries

Contains helper functions and shared utilities.

#### **Files**

- **`prisma.ts`**: Prisma client singleton
  - Creates a single Prisma Client instance
  - Prevents multiple connections in development
  - Provides typed database access
  - Includes query logging in development
  
- **`utils.ts`**: Utility functions
  - `cn()`: Class name merger using clsx and tailwind-merge
  - Used for combining Tailwind classes dynamically

### `/prisma` - Database Schema

Contains database schema and migration files.

#### **Files**

- **`schema.prisma`**: Database schema definition
  - Defines all models (User, TrackingItem, UserTracking, etc.)
  - Specifies enums (ContentCategory, TrackingStatus, RatingScale)
  - Sets up relationships between models
  - Configures database indexes for performance
  
- **`seed.ts`**: Database seeding script
  - Populates database with sample data
  - Creates demo user with various tracking items
  - Includes test data across all categories
  - Generates random statuses, ratings, and progress

### `/public` - Static Assets

Contains static files served directly by Next.js:

- Images, icons, fonts
- Favicons, logos
- Static assets that don't require processing

## Key Files

### Configuration Files

#### **`package.json`**

Defines project metadata, dependencies, and scripts:

```json
{
  "name": "book-tracking",
  "scripts": {
    "dev": "next dev",              // Start development server
    "build": "next build",          // Build for production
    "start": "next start",          // Start production server
    "lint": "next lint",            // Run ESLint
    "postinstall": "prisma generate", // Auto-generate Prisma client
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

#### **`tsconfig.json`**

TypeScript configuration for type safety:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]  // Enable @/ imports
    }
  }
}
```

#### **`tailwind.config.ts`**

Tailwind CSS configuration with shadcn/ui theme:

```typescript
{
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS custom properties for theming
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // ... more colors
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

#### **`next.config.js`**

Next.js framework configuration:

```javascript
{
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',  // Limit server action payload size
    },
  },
  images: {
    domains: ['images.unsplash.com'], // Allowed image domains
  },
}
```

#### **`vercel.json`**

Vercel deployment configuration:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "edge"  // Run API routes on Edge Functions
    }
  },
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install && npx prisma generate"
}
```

#### **`.eslintrc.json`**

Code linting rules:

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "warn"
  }
}
```

## Data Flow

### User Request Flow

```
User Action
    │
    ▼
React Component (UI)
    │
    ▼
fetch() or API Call
    │
    ▼
Next.js API Route (Edge Function)
    │
    ▼
Prisma Client (ORM)
    │
    ▼
PostgreSQL Database
    │
    ▼
Return Data
    │
    ▼
Update UI State
```

### Example: Adding a Tracking Item

1. **User Interaction**
   - User clicks "Add New Item" button
   - Modal opens with form

2. **Form Submission**
   - User fills form and submits
   - Component creates request body

3. **API Call**
   ```typescript
   fetch('/api/tracking', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ userId, title, category, ... })
   })
   ```

4. **API Route Handler** (`src/app/api/tracking/route.ts`)
   - Validates request
   - Checks if item exists
   - Creates/updates database record
   - Logs activity

5. **Database Operation** (via Prisma)
   ```typescript
   await prisma.trackingItem.create({
     data: { title, category, description, ... }
   })
   ```

6. **Response**
   - API returns created item
   - Component updates state
   - UI re-renders with new item

## Component Architecture

### Component Hierarchy

```
RootLayout
└── Page (Dashboard)
    ├── Header
    ├── Search & Filters
    ├── Stats Cards
    ├── Category Tabs
    ├── Items Grid
    │   └── Card (xN)
    │       ├── CardHeader
    │       ├── CardContent
    │       └── CardFooter
    └── Add Item Modal
```

### Component Patterns

#### **State Management**

Components use React hooks for local state:

```typescript
const [trackingItems, setTrackingItems] = useState<TrackingItem[]>([])
const [filteredItems, setFilteredItems] = useState<TrackingItem[]>([])
const [loading, setLoading] = useState(true)
```

#### **Data Fetching**

Use `useEffect` for data fetching on component mount:

```typescript
useEffect(() => {
  fetchTrackingItems()
}, [])
```

#### **Filtering**

Derived state for filtered items:

```typescript
useEffect(() => {
  filterItems()
}, [trackingItems, searchQuery, selectedCategory])
```

### Component Communication

- **Props Down**: Pass data to child components
- **State Up**: Child components pass events to parents
- **API Calls**: Components interact with API routes directly

## API Routes

### API Structure

All API routes follow Next.js App Router conventions:

```
src/app/api/
└── tracking/
    └── route.ts        # /api/tracking
```

### Route Handlers

Each route file exports HTTP method handlers:

```typescript
export const runtime = 'edge'  // Use Edge Functions

export async function GET(request: NextRequest) {
  // Handle GET requests
}

export async function POST(request: NextRequest) {
  // Handle POST requests
}

export async function PUT(request: NextRequest) {
  // Handle PUT requests
}

export async function DELETE(request: NextRequest) {
  // Handle DELETE requests
}
```

### Request/Response Flow

**Request:**
```typescript
const body = await request.json()
const searchParams = request.nextUrl.searchParams
```

**Response:**
```typescript
return NextResponse.json(data, { status: 200 })
```

**Error Handling:**
```typescript
try {
  // Database operations
} catch (error) {
  return NextResponse.json(
    { error: 'Failed to fetch items' },
    { status: 500 }
  )
}
```

## Database Models

### Prisma Schema Models

#### **User**
- User accounts and profiles
- Relationships to tracking items and notes

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  password  String?
  trackingItems UserTracking[]
  notes         TrackingNote[]
}
```

#### **TrackingItem**
- Content items (anime, manga, movies, etc.)
- Metadata about the content

```prisma
model TrackingItem {
  id          String          @id @default(cuid())
  title       String
  description String?
  category    ContentCategory
  userTrackings UserTracking[]
  notes         TrackingNote[]
}
```

#### **UserTracking**
- User's relationship with items
- Status, rating, progress

```prisma
model UserTracking {
  id         String         @id @default(cuid())
  userId     String
  itemId     String
  status     TrackingStatus
  rating     RatingScale?
  progress   Int?
  isFavorite Boolean        @default(false)
  user User         @relation(...)
  item TrackingItem @relation(...)
}
```

#### **Relationships**

- **User ↔ TrackingItem**: Many-to-Many via UserTracking
- **User ↔ Note**: One-to-Many
- **TrackingItem ↔ Note**: One-to-Many

### Database Indexes

Optimized queries with indexes:

```prisma
model User {
  email String @unique
  @@index([email])
}

model TrackingItem {
  @@index([category])
  @@index([title])
}

model UserTracking {
  @@unique([userId, itemId])
  @@index([userId])
  @@index([status])
}
```

## Styling Strategy

### Tailwind CSS Approach

**Utility-First**: Use pre-defined utility classes:

```html
<div class="flex items-center gap-2 p-4 bg-primary text-primary-foreground">
  Content
</div>
```

**Responsive Design**: Mobile-first breakpoints:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Cards -->
</div>
```

**Dark Mode**: Use CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### shadcn/ui Components

**Component Structure**:

1. **Primitive**: Radix UI primitives (accessible)
2. **Variants**: Multiple variants using `class-variance-authority`
3. **Styling**: Tailwind classes with CSS variables
4. **Composition**: Composable components

**Example Button**:

```typescript
const buttonVariants = cva(
  "inline-flex items-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input",
        // ...
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        // ...
      }
    }
  }
)
```

### Theme Customization

**CSS Variables**: Define in `globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --radius: 0.5rem;
}
```

**Tailwind Config**: Reference CSS variables:

```typescript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      borderRadius: {
        lg: "var(--radius)",
      }
    }
  }
}
```

## Configuration Files

### Environment Variables

`.env.local` (not committed):

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
NODE_ENV="development"
```

### Git Configuration

`.gitignore`:

```
node_modules/
.next/
.env.local
.DS_Store
*.log
```

### Build Configuration

- **Next.js**: `next.config.js`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: `tailwind.config.ts`
- **PostCSS**: `postcss.config.js`
- **ESLint**: `.eslintrc.json`
- **Vercel**: `vercel.json`

## Best Practices

### Code Organization

1. **Separation of Concerns**: UI, API, and Database are clearly separated
2. **Component Reusability**: UI components are generic and reusable
3. **Type Safety**: TypeScript throughout for better development experience
4. **Consistent Naming**: Follow naming conventions (PascalCase for components, camelCase for functions)

### Performance

1. **Edge Functions**: API routes run on Edge for fast response times
2. **Database Indexes**: Optimized queries with proper indexes
3. **Connection Pooling**: Prisma manages database connections efficiently
4. **Code Splitting**: Next.js automatic code splitting

### Security

1. **Environment Variables**: Secrets never committed to version control
2. **Input Validation**: Server-side validation on all API endpoints
3. **SQL Injection Prevention**: Prisma ORM prevents SQL injection
4. **CORS**: Configured for safe cross-origin requests

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot-reloading
2. **Database Management**: Prisma Studio for visual database management
3. **Code Quality**: ESLint for consistent code style
4. **Type Safety**: TypeScript catches errors at compile time

## Extending the Project

### Adding New Features

1. **New API Endpoint**: Create new route in `src/app/api/`
2. **New Page**: Add file in `src/app/`
3. **New Component**: Create in `src/components/`
4. **New Database Model**: Update `prisma/schema.prisma`

### Adding New Categories

1. Update `ContentCategory` enum in `schema.prisma`
2. Add category icon in `page.tsx`
3. Update category icons object
4. Run `npx prisma db push`

### Adding New UI Components

1. Copy from shadcn/ui or create custom
2. Follow component pattern (forwardRef, variants)
3. Add TypeScript interfaces
4. Import and use in pages

## Summary

The TrackIt project follows modern web development best practices:

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel Edge Functions
- **Type Safety**: TypeScript throughout
- **Code Quality**: ESLint, consistent patterns

The architecture is designed to be:

- **Scalable**: Easy to add new features
- **Maintainable**: Clear separation of concerns
- **Performant**: Edge functions, optimized queries
- **Developer-Friendly**: TypeScript, hot-reloading, Prisma Studio

---

**For more information, see:**
- [README.md](README.md) - Main documentation
- [SETUP.md](SETUP.md) - Setup instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
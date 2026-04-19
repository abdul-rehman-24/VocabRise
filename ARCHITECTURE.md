# VocabRise - Backend & Frontend Architecture

## 📁 Project Structure

```
VocabRiseShort/
├── app/                           # Next.js App Router
│   ├── api/                       # Backend API Routes
│   │   ├── auth/                  # Authentication endpoints
│   │   │   ├── [...nextauth]/     # NextAuth configuration
│   │   │   └── signup/            # Sign up endpoint
│   │   ├── admin/                 # Admin endpoints (protected)
│   │   │   ├── users/
│   │   │   ├── words/
│   │   │   └── stats/
│   │   ├── user/                  # User endpoints
│   │   │   ├── profile/
│   │   │   ├── stats/
│   │   │   └── xp/
│   │   ├── leaderboard/           # Leaderboard endpoint
│   │   ├── posts/                 # Posts/community endpoint
│   │   ├── quiz/                  # Quiz endpoint
│   │   ├── word-of-day/           # Word of the day endpoint
│   │   └── upload/                # Image upload endpoint
│   │
│   ├── components/                # React Components
│   │   ├── auth/                  # Login/signup forms
│   │   ├── dashboard/             # Dashboard components
│   │   ├── feed/                  # Social feed
│   │   ├── shared/                # Navbar, Footer, etc.
│   │   └── wotd/                  # Word of the day
│   │
│   ├── lib/                       # Utilities & Config
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client
│   │   ├── types.ts               # TypeScript types
│   │   └── cloudinary.ts          # Cloudinary config
│   │
│   ├── hooks/                     # React Hooks
│   │   └── useAuth.ts             # Authentication hook
│   │
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
│
├── prisma/                        # Database
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Test data seed
│   └── migrations/                # Database migrations
│
├── types/                         # Type definitions
│   └── next-auth.d.ts            # NextAuth types
│
├── public/                        # Static files
│
└── Startup Files (THESE ARE NEW!)
    ├── start-project.bat          # ⭐ Run everything (batch)
    ├── start-project.ps1          # ⭐ Run everything (PowerShell)
    ├── start-backend.bat          # Backend setup (batch)
    ├── start-backend.ps1          # Backend setup (PowerShell)
    ├── start-frontend.bat         # Frontend server (batch)
    ├── start-frontend.ps1         # Frontend server (PowerShell)
    ├── STARTUP_GUIDE.md           # This guide
    └── .env.example               # Environment template
```

---

## 🖥️ Frontend

### What is the Frontend?
The **frontend** is the user interface - the React components that users interact with in their browser.

### Frontend Technologies:
- **Next.js 15** - React framework with file-based routing
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **TypeScript** - Type-safe JavaScript

### Frontend Folders:
- `app/` - All React pages and components
- `app/components/` - Reusable UI components
- `app/hooks/` - Custom React hooks
- `public/` - Static assets

### Frontend Port:
```
http://localhost:3000
```

### Start Frontend Only:
```bash
# Option 1: Double-click
start-frontend.bat

# Option 2: Command
npm run dev
```

---

## 🔧 Backend

### What is the Backend?
The **backend** is the server-side logic - API routes that handle requests, authenticate users, and interact with the database.

### Backend Technologies:
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database operations
- **PostgreSQL** - Data storage
- **NextAuth.js** - Authentication & authorization
- **bcryptjs** - Password hashing

### Backend Folders:
- `app/api/` - All API endpoints
- `prisma/` - Database configuration & migrations
- `app/lib/auth.ts` - Authentication logic

### Backend Database:
```
PostgreSQL on localhost:5432
Database: vocabrise
Username: postgres
```

### Backend Setup:
```bash
# Option 1: Double-click
start-backend.bat

# Option 2: Commands
npx prisma db push
npx prisma db seed
```

---

## 🔄 Request Flow

### Example: User Login with Google

```
1. User clicks "Sign In with Google" (Frontend)
   ↓
2. Request goes to /api/auth/[...nextauth]/route.ts (Backend)
   ↓
3. NextAuth handles Google OAuth
   ↓
4. Backend checks if user exists in database
   ↓
5. If new user: Create user record in PostgreSQL
   ↓
6. Create JWT token and session
   ↓
7. Redirect to /dashboard (Frontend)
   ↓
8. React component reads session and displays dashboard
```

---

## 📊 Database Schema

### Main Models:

```prisma
User (id, email, name, role, passwordHash)
  ├── authProviders (Google OAuth links)
  ├── userStats (XP, level, streaks)
  ├── posts (user's vocabulary posts)
  ├── likes (posts user liked)
  └── comments (user's comments)

WordOfDay (daily vocabulary words)
  └── savedWords (users' saved words)

Post (community vocabulary posts)
  ├── likes (who liked this post)
  └── comments (post comments)
```

### View Database:
```bash
# Visual UI at http://localhost:5555
npx prisma studio
```

---

## 🚀 Complete Startup Process

```
1. start-project.bat (EASIEST!)
   │
   ├─ Check Node.js installed
   ├─ npm install (if needed)
   ├─ npx prisma db push (sync schema)
   ├─ npx prisma db seed (add test data)
   └─ npm run dev (start server)
   
2. Server runs at:
   ├─ Frontend: http://localhost:3000
   ├─ API: http://localhost:3000/api/*
   └─ Database UI: http://localhost:5555
```

---

## 📋 API Endpoints

### Public Endpoints:
```
GET    /api/word-of-day              - Get daily word
GET    /api/leaderboard              - Get rankings
GET    /api/posts                    - Get community posts
GET    /api/posts/[id]/like          - Like/unlike post
POST   /api/auth/signup              - Create account
GET    /api/auth/[...nextauth]       - Google OAuth
```

### Protected Endpoints (Requires Login):
```
GET    /api/user/profile             - Get user profile
PATCH  /api/user/profile             - Update profile
GET    /api/user/stats               - Get user statistics
POST   /api/user/xp                  - Add XP points
POST   /api/quiz                     - Submit quiz
```

### Admin Endpoints (Requires Admin Role):
```
GET    /api/admin/users              - List all users
GET    /api/admin/words              - List all words
GET    /api/admin/stats              - System statistics
```

---

## 🔐 Authentication Flow

### Google OAuth:
```
1. User clicks "Sign In with Google"
2. Redirects to Google login
3. Google redirects back with code
4. Backend exchanges code for token
5. Backend creates/updates user in DB
6. JWT token created and stored
7. User logged in!
```

### Credentials (Future):
```
1. User enters email + password
2. Backend hashes password with bcryptjs
3. Compare with stored hash
4. If match: create JWT token
5. User logged in!
```

---

## 🛡️ Security Features

- ✅ JWT authentication (stateless sessions)
- ✅ Google OAuth integration
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes with middleware
- ✅ Admin role-based access control
- ✅ NextAuth.js best practices
- ✅ Environment variables for secrets
- ✅ Secure cookies for JWT tokens

---

## 📚 Running Different Parts

### Just Frontend:
```bash
# Won't work without backend!
npm run dev
```

### Just Backend Setup:
```bash
# Database only, no web server
npx prisma db push
npx prisma db seed
npx prisma studio  # View database
```

### Everything (RECOMMENDED):
```bash
# ⭐ This one!
start-project.bat

# Or
npm run dev
```

---

## 💡 Development Tips

### Hot Reload
React components auto-refresh when you save files. API routes require restart.

### Debug SQL
```bash
npx prisma studio  # Visual database editor
```

### Reset Database
```bash
# WARNING: Deletes all data!
npx prisma migrate reset
```

### Check Logs
```bash
# Terminal shows requests and errors
npm run dev
```

---

## 🎯 File You Need to Know

| File | Purpose |
|------|---------|
| `.env.local` | Your database credentials (KEEP PRIVATE!) |
| `prisma/schema.prisma` | Database schema definition |
| `app/lib/auth.ts` | Authentication configuration |
| `app/api/` | All backend endpoints |
| `app/components/` | All React components |
| `types/next-auth.d.ts` | TypeScript types |

---

## ✅ Verification Checklist

After starting:
- [ ] App loads at http://localhost:3000
- [ ] Can click "Sign In"
- [ ] Can see Google login button
- [ ] Database UI works at http://localhost:5555
- [ ] Can see 5 test users in database
- [ ] Can see 10 vocabulary words

---

## 🚀 Next: Deploy to Production

When ready to deploy:
```bash
npm run build    # Build for production
npm run start    # Start production server

# Or deploy to:
# - Vercel (recommended)
# - Railway
# - AWS
# - Azure
# - DigitalOcean
# - Heroku
```

---

Good luck! Happy coding! 🎉

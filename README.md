# VocabRise - Vocabulary Learning Community App

A modern vocabulary learning platform with real-time community engagement and Word of the Day features.

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Email + Google OAuth)
- **Media**: Cloudinary for avatar/image management
- **Language**: TypeScript

## Phase 1 Features
- User authentication (email/password + Google Sign-In)
- Word of the Day discovery page
- Community feed for sharing words
- User dashboard with profile
- Avatar uploads via Cloudinary

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npm run db:push

# Run development server
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to get started.

## Project Structure
- `app/` - Next.js App Router pages and components
- `app/api/` - API routes (auth, posts, uploads)
- `app/components/` - Reusable React components
- `app/lib/` - Utility functions and configuration
- `app/hooks/` - Custom React hooks
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Environment Variables
See `.env.example` for required configuration.

## License
MIT

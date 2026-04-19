# Vocabulary Passport Feature - Setup Guide

## 📋 Overview

The Vocabulary Passport feature has been fully integrated into the VocabRise app. It allows users to collect words they've learned and track their progress with visual badges and achievements.

## 🚀 What Was Changed

### Database Schema
- Added `CollectedWord` model to track learned words per user
- Updated `UserStats` to include `collectedWords` relationship
- Removed `wordsLearned` field (now calculated from collected words count)

### New Database Migration
- Location: `prisma/migrations/20260417_add_collected_words/migration.sql`
- Creates `collected_words` table with proper relationships

### New API Routes
1. **GET /api/passport/words**
   - Fetches all collected words for current user
   - Returns user stats, joined date, collected words, and streak info

2. **POST /api/passport/add-word**
   - Adds a new word to user's collection
   - Accepts: `word`, `definition`, `category`, `difficulty`
   - Prevents duplicate entries

### New Component
- **VocabularyPassport** (`app/components/VocabularyPassport.tsx`)
  - Complete interactive passport experience
  - Integrates with useAuth hook
  - Fetches real data from API
  - Responsive and fully styled

### New Page Route
- **Passport Page** (`app/passport/page.tsx`)
  - Accessible at `/passport`
  - Requires authentication

### Navigation Update
- Added "Passport" link to navbar (`app/components/shared/Navbar.tsx`)
- Positioned between Dashboard and Community Feed

### Seed Data Updates
- Updated `prisma/seed.ts` to include test collected words
- Test users now have 5-13 collected words each

### Type Updates
- Added `CollectedWord` interface to `app/lib/types.ts`

## 🛠️ Setup Instructions

### 1. Run Database Migration
```bash
npx prisma migrate deploy
```

### 2. Update Prisma Client
```bash
npx prisma generate
```

### 3. Reseed Database (Optional - to add test data)
```bash
npx prisma db seed
```

## 📱 Features Included

### Passport Cover Screen
- Professional passport-style design
- Gold and navy color scheme
- User name and join date display
- Flip animation to open

### Stamp Grid (Inside Pages)
- Grid of collected words as colored stamps
- Color-coded by category (Blue/Purple/Gold)
- Interactive tooltips to see full word names
- Empty slots for future words
- Smooth pop animation when words are added

### Milestone Badges
- Bronze Badge (10 words)
- Silver Badge (50 words)
- Gold Badge (100 words)
- Platinum Badge (250 words)
- Progress bars for locked badges
- Shimmer animation for unlocked badges

### Statistics Page
- Total words learned
- Current rank (Beginner → Explorer → Scholar → Master → Legend)
- Longest and current streak
- Category breakdown with visual charts
- Member since date
- Progress bar to next milestone

### Word Learning
- "Learn New Word" button adds random available words
- Prevents duplicate words
- Celebration modal on milestone unlock
- Confetti animation

### Shareable Achievement Card
- Beautiful styled card showing achievements
- Top 5 hardest words learned
- Share to WhatsApp button
- Copy achievement text to clipboard
- Download as PNG image (via html2canvas)

### Category Filtering
- Filter words by: All, Common, Advanced, GRE
- Shows count for each category

## 🔐 Authentication
- Component requires user to be authenticated (uses `useAuth` hook)
- Shows message if user is not signed in
- All API routes require valid session

## 🎨 Styling
- Uses app's color scheme (#080810 dark background)
- Tailwind CSS for responsive design
- Custom animations for flip, confetti, shimmer, and pop effects
- Matches existing VocabRise design language

## ✅ Testing

Navigate to `/passport` after signing in to test:

1. **View passport** - See cover, stamps, and stats pages
2. **Add words** - Click "Learn New Word" button
3. **Milestones** - Reach 10 words to see celebration
4. **Share card** - Click "Share Achievement" on stats page
5. **Download** - Generate and download achievement card

## 📝 API Examples

### Get Passport Words
```bash
GET /api/passport/words
```

Response:
```json
{
  "userName": "Ahmed Khan",
  "joinedDate": "2026-04-15T10:30:00.000Z",
  "collectedWords": [
    {
      "id": "cuid-123",
      "word": "Eloquent",
      "definition": "Fluent and persuasive",
      "category": "advanced", 
      "difficulty": 4,
      "collectedAt": "2026-04-16T14:20:00.000Z"
    }
  ],
  "totalWords": 23,
  "longestStreak": 12,
  "currentStreak": 5
}
```

### Add Word
```bash
POST /api/passport/add-word
Content-Type: application/json

{
  "word": "Serendipity",
  "definition": "Finding something good without looking for it",
  "category": "gre",
  "difficulty": 5
}
```

Response:
```json
{
  "id": "cuid-456",
  "word": "Serendipity",
  "definition": "Finding something good without looking for it",
  "category": "gre",
  "difficulty": 5,
  "collectedAt": "2026-04-17T10:45:00.000Z"
}
```

## 🐛 Troubleshooting

### Words not appearing
- Clear browser cache
- Check browser console for API errors
- Verify user is authenticated

### Download image not working
- Check if html2canvas loaded (should be in network tab)
- Try different browser
- Check console for errors

### Animations not smooth
- Check if transforms are enabled in CSS
- Verify browser supports CSS animations

## 📦 Dependencies
- `next-auth` - Already installed
- `lucide-react` - For icons (already installed)
- `html2canvas` - Loaded from CDN for image download
- Tailwind CSS - For styling (already configured)

## 🔄 Future Enhancements

Potential additions:
- Word pronunciation audio
- Definition example sentences
- Export collected words as PDF
- Leaderboard comparison
- Word difficulty ratings from community
- Scheduled word reminders
- Integration with quiz module
- Word etymology display

# VocabRise - Database Schema Analysis Report

## 1. Current State of the Schema
The `prisma/schema.prisma` currently establishes a solid, relational structure supporting the core features of the VocabRise application:
- **Authentication:** `User` and `AuthProvider` natively support NextAuth integration.
- **Gamification:** `UserStats` tracks `totalXP`, `level`, and `streaks` comprehensively. `CollectedWord` supports the Vocabulary Passport.
- **Community:** `Post`, `Like`, `Dislike`, and `Comment` establish a full social feed for users to share words.
- **Daily Content:** `WordOfDay` and `SavedWord` securely link global vocabulary dumps to individual user libraries.
- **Word of the Week:** Newly added `Nomination` and `WeeklyVote` efficiently govern weekly aggregated contests using composite keys (`weekNumber`, `weekYear`).

## 2. Issues & Limitations Identified (The "Problems")
While the schema is functional, structural gaps prevent true gamified retention tracking:

1. **No Quiz History (Missing Data Layer):**
   - The app has `/quiz` routes, but the schema has no `QuizResult` or `QuizAttempt` models. Even if XP is granted on completion, users cannot see their past performance, review exactly which words they failed, or track long-term progress.
2. **No Pronunciation State:**
   - The app contains a `PronunciationFeature` and `/pronunciation` routes, but there's no boolean or status inside `SavedWord` or `CollectedWord` mapping whether the user successfully passed the microphone/speech check.
3. **Missing Notification System:**
   - As a social application where people can "like" and "comment" on your vocabulary `Post` or vote on your `Nomination`, the lack of an `InAppNotification` table means users are never blindly alerted when their contributions gain traction (except via manual page refreshes).
4. **"SavedWord" vs "CollectedWord" Overlap:**
   - There's slight redundancy between `SavedWord` (tied directly to `WordOfDay`) and `CollectedWord` (tied to `UserStats` in the Passport). These could arguably be unified, or one should act merely as a dictionary while the other tracks mastery logic.

## 3. Recommended Improvements (What is Needed)
To resolve these gaps and future-proof the application, I recommend appending the following models to `prisma/schema.prisma`:

### A. Quiz Tracking
```prisma
model QuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  score       Int      // e.g., 8/10
  maxScore    Int      @default(10)
  category    String?  // Optional thematic quiz category
  xpEarned    Int      @default(0)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("quiz_attempts")
}
```

### B. In-App Notifications
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "LIKE", "COMMENT", "VOTE", "SYSTEM"
  message     String
  isRead      Boolean  @default(false)
  link        String?  // Optional redirect URL (e.g. to the post)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}
```

### C. Refined Mastery on Collected Words
Update the `CollectedWord` or `SavedWord` model to include:
```prisma
  // Adding to SavedWord tracking:
  masteryLevel Int     @default(0) // 0=Learning, 1=Familiar, 2=Mastered
  hasPronounced Boolean @default(false) // Triggered via the PronunciationFeature
```

## 4. Next Action
If you want to move forward with these optimizations (especially the **Quiz History** and **Notifications** layers which are critical for the endpoints you already have scaffolded in `/app/api/quiz` and `/components/PronunciationFeature.tsx`), simply let me know. 

I can inject these models right into your `schema.prisma` and execute a database migration immediately to resolve the structural boundaries.
import { prisma } from '@/app/lib/prisma'

export async function calculateStreak(userId: string): Promise<number> {
  // Get user stats
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    include: {
      collectedWords: {
        orderBy: { collectedAt: 'desc' }
      }
    }
  })

  if (!stats) {
    return 0
  }

  // Extract unique dates
  const learnedDates = new Set(
    stats.collectedWords.map(w => {
      const d = new Date(w.collectedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  // Count consecutive days from today backwards
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  while (learnedDates.has(currentDate.getTime())) {
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

export async function updateStreakInDB(userId: string) {
  // Calculate new streak
  const newStreak = await calculateStreak(userId)

  // Get current longest streak
  const stats = await prisma.userStats.findUnique({
    where: { userId }
  })

  if (!stats) {
    throw new Error('User not found')
  }

  const newLongestStreak = Math.max(newStreak, stats.longestStreak || 0)

  // Update database
  const updatedStats = await prisma.userStats.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak
    }
  })

  return { currentStreak: newStreak, longestStreak: newLongestStreak }
}

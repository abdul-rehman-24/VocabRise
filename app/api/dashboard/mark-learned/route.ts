import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { calculateNewLevel } from '@/lib/xp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { wordOfDayId } = await request.json()

    if (!wordOfDayId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Get user stats
    let stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!stats) {
      // Create stats if doesn't exist
      stats = await prisma.userStats.create({
        data: { userId }
      })
    }

    // Fetch the word of the day
    const wordOfDay = await prisma.wordOfDay.findUnique({
      where: { id: wordOfDayId }
    })

    if (!wordOfDay) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    // 1. Add word to collected words (marking as learned)
    await prisma.collectedWord.upsert({
      where: {
        userStatsId_word: {
          userStatsId: stats.id,
          word: wordOfDay.word
        }
      },
      update: {},
      create: {
        userStatsId: stats.id,
        word: wordOfDay.word,
        definition: wordOfDay.definition,
        category: 'word-of-day',
        difficulty: 3
      }
    })

    // 2. Add 10 XP to user stats
    const newXP = (stats.totalXP || 0) + 10
    const newLevel = calculateNewLevel(newXP)

    // 3. Calculate and update streak
    const collectedWords = await prisma.collectedWord.findMany({
      where: { userStatsId: stats.id },
      orderBy: { collectedAt: 'desc' }
    })

    // Count consecutive days from today backwards
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const learnedDates = new Set(
      collectedWords.map(w => {
        const d = new Date(w.collectedAt)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )

    while (learnedDates.has(currentDate.getTime())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    const newLongestStreak = Math.max(streak, stats.longestStreak || 0)

    // 4. Update user stats with new XP, level, streak
    const updatedStats = await prisma.userStats.update({
      where: { userId },
      data: {
        totalXP: newXP,
        level: newLevel,
        currentStreak: streak,
        longestStreak: newLongestStreak,
        wordsLearned: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      newXP,
      newLevel,
      newStreak: streak
    })
  } catch (error) {
    console.error('Mark learned API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

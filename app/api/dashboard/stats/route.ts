import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user and user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { stats: true }
    })

    if (!user || !user.stats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch daily goal count (collected words today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dailyCount = await prisma.collectedWord.count({
      where: {
        userStats: { userId },
        collectedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    return NextResponse.json({
      displayName: user.name,
      streak: user.stats.currentStreak,
      xp: user.stats.totalXP,
      level: user.stats.level,
      dailyGoalCount: dailyCount,
      dailyGoalTarget: 5,
      wordsLearned: user.stats.wordsLearned || 0
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

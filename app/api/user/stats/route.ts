import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    if (!stats) {
      return NextResponse.json({
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        wordsLearned: 0,
      })
    }

    return NextResponse.json({
      totalXP: stats.totalXP,
      level: stats.level,
      currentStreak: stats.currentStreak,
      wordsLearned: stats.wordsLearned,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { addXP } from '@/lib/xp'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { score, maxScore, category, xpEarned } = body

    // 1. Log the Quiz Attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        score: score || 0,
        maxScore: maxScore || 10,
        category: category || 'general',
        xpEarned: xpEarned || 0,
      }
    })

    // 2. Award XP through the gamification engine
    if (xpEarned > 0) {
      await addXP(user.id, xpEarned)
    }

    // 3. Mark the streak active for taking a quiz
    const stats = await prisma.userStats.findUnique({ where: { userId: user.id } })
    if (stats) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null
      if (lastActive) lastActive.setHours(0, 0, 0, 0)

      if (!lastActive || lastActive.getTime() < today.getTime()) {
        const isConsecutive = lastActive && (today.getTime() - lastActive.getTime() === 86400000)
        await prisma.userStats.update({
          where: { userId: user.id },
          data: {
            currentStreak: isConsecutive ? stats.currentStreak + 1 : 1,
            longestStreak: isConsecutive ? Math.max(stats.longestStreak, stats.currentStreak + 1) : Math.max(stats.longestStreak, 1),
            lastActiveDate: new Date()
          }
        })
      }
    }

    return NextResponse.json({ success: true, attempt })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json({ error: 'Failed to submit quiz results' }, { status: 500 })
  }
}

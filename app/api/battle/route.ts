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

    const { finalXP, isWin } = await request.json()

    // 1. Award XP the Word Battle returned
    if (finalXP > 0) {
      await addXP(user.id, finalXP)
    }

    // 2. Mark streak / participation
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

    return NextResponse.json({ success: true, earnedXP: finalXP })
  } catch (error) {
    console.error('WordBattle submission error:', error)
    return NextResponse.json({ error: 'Failed to record battle results' }, { status: 500 })
  }
}

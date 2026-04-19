import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: Request) {
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

    const { xp } = await request.json()

    if (typeof xp !== 'number' || xp < 0) {
      return NextResponse.json({ error: 'Invalid XP value' }, { status: 400 })
    }

    // Find or create UserStats
    let stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    // Calculate streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let newStreak = 1
    let newLongestStreak = 1

    if (stats && stats.lastActiveDate) {
      const lastActive = new Date(stats.lastActiveDate)
      lastActive.setHours(0, 0, 0, 0)
      
      const dayDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === 0) {
        // Same day, keep current streak
        newStreak = stats.currentStreak
      } else if (dayDiff === 1) {
        // Consecutive day, increment streak
        newStreak = stats.currentStreak + 1
      }
      // else: dayDiff > 1, reset streak to 1
      
      newLongestStreak = Math.max(newStreak, stats.longestStreak)
    }

    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          userId: user.id,
          totalXP: xp,
          level: Math.floor(xp / 100) + 1,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: new Date(),
        },
      })
    } else {
      const newTotalXP = stats.totalXP + xp
      const newLevel = Math.floor(newTotalXP / 100) + 1

      stats = await prisma.userStats.update({
        where: { userId: user.id },
        data: {
          totalXP: newTotalXP,
          level: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: new Date(),
        },
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error updating XP:', error)
    return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 })
  }
}

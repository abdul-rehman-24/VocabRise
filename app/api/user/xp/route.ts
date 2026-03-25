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

    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          userId: user.id,
          totalXP: xp,
          level: Math.floor(xp / 100) + 1,
          wordsLearned: 1,
          currentStreak: 0,
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
          wordsLearned: { increment: 1 },
        },
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error updating XP:', error)
    return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 })
  }
}

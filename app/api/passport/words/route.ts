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
      include: {
        stats: {
          include: {
            collectedWords: {
              orderBy: { collectedAt: 'desc' },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stats = user.stats || {
      id: '',
      userId: user.id,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      collectedWords: [],
    }

    const collectedWords = stats.collectedWords || []

    return NextResponse.json({
      userName: user.name || 'VocabRise Student',
      joinedDate: user.createdAt,
      collectedWords,
      totalWords: collectedWords.length,
      longestStreak: stats.longestStreak || 0,
      currentStreak: stats.currentStreak || 0,
    })
  } catch (error) {
    console.error('Error fetching passport words:', error)
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 })
  }
}

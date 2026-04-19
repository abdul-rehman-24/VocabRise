import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { word, definition, category = 'advanced', difficulty = 3 } = body

    if (!word || !definition) {
      return NextResponse.json(
        { error: 'Word and definition are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { stats: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let stats = user.stats
    if (!stats) {
      stats = await prisma.userStats.create({
        data: { userId: user.id },
      })
    }

    // Check if word already collected
    const existing = await prisma.collectedWord.findUnique({
      where: {
        userStatsId_word: {
          userStatsId: stats.id,
          word,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Word already collected' },
        { status: 409 }
      )
    }

    const collectedWord = await prisma.collectedWord.create({
      data: {
        userStatsId: stats.id,
        word,
        definition,
        category,
        difficulty,
      },
    })

    return NextResponse.json(collectedWord, { status: 201 })
  } catch (error) {
    console.error('Error adding collected word:', error)
    return NextResponse.json(
      { error: 'Failed to add word' },
      { status: 500 }
    )
  }
}

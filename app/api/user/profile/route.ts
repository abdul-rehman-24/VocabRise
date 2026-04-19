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
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        stats: {
          select: {
            totalXP: true,
            level: true,
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true,
            collectedWords: true,
          },
        },
        posts: {
          select: {
            id: true,
            word: true,
            likesCount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            posts: true,
            likes: true,
            savedWords: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Transform stats to include wordsLearned count
    const transformedUser = {
      ...user,
      stats: user.stats ? {
        ...user.stats,
        wordsLearned: user.stats.collectedWords?.length || 0,
        collectedWords: undefined,
      } : null,
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, bio } = await request.json()

    // Validate input
    if (name && (typeof name !== 'string' || name.length < 1 || name.length > 100)) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 100 characters' },
        { status: 400 }
      )
    }

    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json(
        { error: 'Bio must not exceed 500 characters' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        stats: {
          select: {
            totalXP: true,
            level: true,
            currentStreak: true,
            longestStreak: true,
            collectedWords: true,
          },
        },
      },
    })

    // Transform stats to include wordsLearned count
    const transformedUser = {
      ...user,
      stats: user.stats ? {
        ...user.stats,
        wordsLearned: user.stats.collectedWords?.length || 0,
        collectedWords: undefined,
      } : null,
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}

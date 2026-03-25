import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    if (isNaN(page) || isNaN(limit)) {
      return NextResponse.json({ error: 'Invalid pagination params' }, { status: 400 })
    }

    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count(),
    ])

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

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

    const { word, definition, urduMeaning, example } = await request.json()

    // Validate inputs
    if (!word || typeof word !== 'string' || word.trim().length < 2 || word.length > 50) {
      return NextResponse.json({ error: 'Word must be 2-50 characters' }, { status: 400 })
    }

    if (!definition || typeof definition !== 'string' || definition.length < 10 || definition.length > 500) {
      return NextResponse.json({ error: 'Definition must be 10-500 characters' }, { status: 400 })
    }

    if (urduMeaning && (typeof urduMeaning !== 'string' || urduMeaning.length > 200)) {
      return NextResponse.json({ error: 'Urdu meaning must be max 200 characters' }, { status: 400 })
    }

    if (example && (typeof example !== 'string' || example.length > 500)) {
      return NextResponse.json({ error: 'Example must be max 500 characters' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        word,
        definition,
        urduMeaning: urduMeaning || null,
        example: example || null,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

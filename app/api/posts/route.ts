import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { addXP } from '@/lib/xp'

// Simple in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute between posts

// Simple profanity list (for demonstration)
const badWords = ['spam', 'abuse', 'hate', 'profanity'];

const containsProfanity = (text: string) => {
  const lower = text.toLowerCase();
  return badWords.some(word => lower.includes(word));
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const sort = searchParams.get('sort') || 'latest'

    if (isNaN(page) || isNaN(limit)) {
      return NextResponse.json({ error: 'Invalid pagination params' }, { status: 400 })
    }

    const skip = (page - 1) * limit

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'trending') {
      orderBy = { likesCount: 'desc' };
    } else if (sort === 'discussed') {
      orderBy = { comments: { _count: 'desc' } };
    }

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
          _count: {
            select: { comments: true }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count(),
    ])

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=59',
      }
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

    // Rate Limiting Check
    const lastPostTime = rateLimitMap.get(session.user.email);
    const now = Date.now();
    if (lastPostTime && now - lastPostTime < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json({ error: 'You are posting too fast. Please wait a minute.' }, { status: 429 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { word, definition, urduMeaning, example, difficulty } = await request.json()

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

    const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    const finalDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'INTERMEDIATE';

    // Profanity Check
    if (containsProfanity(word) || containsProfanity(definition) || (example && containsProfanity(example))) {
      return NextResponse.json({ error: 'Content contains inappropriate language' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        word,
        definition,
        urduMeaning: urduMeaning || null,
        example: example || null,
        difficulty: finalDifficulty as any,
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

    // Add +10 XP for posting a word
    await addXP(user.id, 10);

    // Update rate limit
    rateLimitMap.set(session.user.email, now);

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

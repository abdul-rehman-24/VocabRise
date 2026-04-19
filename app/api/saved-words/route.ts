import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const [savedWords, total] = await Promise.all([
      prisma.savedWord.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedWord.count({
        where: { userId: user.id },
      }),
    ])

    return NextResponse.json({
      savedWords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching saved words:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved words' },
      { status: 500 }
    )
  }
}

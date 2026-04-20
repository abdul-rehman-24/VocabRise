import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch latest word of the day or a specific word
    const wordOfDay = await prisma.wordOfDay.findFirst({
      orderBy: { dayIndex: 'desc' },
      take: 1
    })

    if (!wordOfDay) {
      return NextResponse.json({
        id: null,
        word: null,
        definition: null,
        urduMeaning: null,
        example: null,
        difficulty: null,
        isSaved: false
      })
    }

    // Check if user has saved this word
    const savedWord = await prisma.savedWord.findFirst({
      where: {
        userId,
        wordOfDayId: wordOfDay.id
      }
    })

    return NextResponse.json({
      id: wordOfDay.id,
      word: wordOfDay.word,
      definition: wordOfDay.definition,
      urduMeaning: wordOfDay.urduMeaning,
      example: wordOfDay.example,
      difficulty: wordOfDay.difficulty,
      isSaved: !!savedWord
    })
  } catch (error) {
    console.error('Word of day API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

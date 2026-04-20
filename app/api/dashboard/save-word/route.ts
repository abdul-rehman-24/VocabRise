import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { wordOfDayId } = await request.json()

    if (!wordOfDayId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Fetch the word of the day
    const wordOfDay = await prisma.wordOfDay.findUnique({
      where: { id: wordOfDayId }
    })

    if (!wordOfDay) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    // Check if already saved
    const existingSave = await prisma.savedWord.findFirst({
      where: {
        userId,
        wordOfDayId
      }
    })

    if (existingSave) {
      return NextResponse.json({ saved: true })
    }

    // Insert into saved_words
    await prisma.savedWord.create({
      data: {
        userId,
        wordOfDayId,
        word: wordOfDay.word,
        definition: wordOfDay.definition,
        urduMeaning: wordOfDay.urduMeaning
      }
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Save word API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    // Calculate which word to show based on current date
    const start = new Date('2025-01-01')
    const today = new Date()
    const dayNumber = Math.floor(
      (today.getTime() - start.getTime()) / 86400000
    ) + 1

    // Get total number of words
    const totalWords = await prisma.wordOfDay.count()

    // Return 404 if no words exist
    if (totalWords === 0) {
      return NextResponse.json(
        { error: 'No words available' },
        { status: 404 }
      )
    }

    // Calculate the index using modulo to cycle through words
    const index = ((dayNumber - 1) % totalWords) + 1

    // Fetch the word with the calculated index
    const word = await prisma.wordOfDay.findFirst({
      where: {
        dayIndex: index,
      },
    })

    // Return 404 if word not found
    if (!word) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(word)
  } catch (error) {
    console.error('Error fetching word of the day:', error)
    return NextResponse.json(
      { error: 'Failed to fetch word of the day' },
      { status: 500 }
    )
  }
}
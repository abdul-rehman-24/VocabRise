import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    // Fetch 5 random words
    const words = await prisma.wordOfDay.findMany({
      take: 5,
      orderBy: {
        dayIndex: 'asc',
      },
    })

    if (words.length === 0) {
      return NextResponse.json({ error: 'No words available' }, { status: 404 })
    }

    // Create quiz questions
    const questions = words.map((word, index) => {
      // Get 3 random words for wrong answers
      const otherWords = words.filter(w => w.id !== word.id)
      let wrongAnswers = otherWords
        .slice(0, 3)
        .map(w => w.definition)

      // If not enough words, add fake wrong answers
      if (wrongAnswers.length < 3) {
        const fakeAnswers = [
          'A feeling of great pleasure or joy',
          'The quality of being honest and fair',
          'The ability to understand and share another person\'s feelings',
          'A state of complete physical, mental and social well-being',
          'The process of gaining knowledge or skills',
          'The capacity to recover quickly from difficulties',
          'A strong desire or ambition to succeed',
          'The quality of being reliable and consistent',
        ]
        while (wrongAnswers.length < 3) {
          const randomFake = fakeAnswers[Math.floor(Math.random() * fakeAnswers.length)]
          if (!wrongAnswers.includes(randomFake)) {
            wrongAnswers.push(randomFake)
          }
        }
      }

      // Combine and shuffle options
      const options = [word.definition, ...wrongAnswers].sort(() => Math.random() - 0.5)

      return {
        id: word.id,
        word: word.word,
        correctAnswer: word.definition,
        options,
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

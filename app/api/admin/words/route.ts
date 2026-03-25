import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const words = await prisma.wordOfDay.findMany({
      orderBy: { dayIndex: 'asc' },
    })

    return NextResponse.json(words)
  } catch (error) {
    console.error('Error fetching words:', error)
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 })
  }
}

const validateWordInput = (data: any) => {
  const errors: string[] = []
  
  if (!data.word || typeof data.word !== 'string' || data.word.trim().length < 2 || data.word.length > 50) {
    errors.push('Word must be 2-50 characters')
  }
  
  if (!data.definition || typeof data.definition !== 'string' || data.definition.length < 10 || data.definition.length > 500) {
    errors.push('Definition must be 10-500 characters')
  }
  
  if (data.urduMeaning && (typeof data.urduMeaning !== 'string' || data.urduMeaning.length > 200)) {
    errors.push('Urdu meaning must be max 200 characters')
  }
  
  if (data.example && (typeof data.example !== 'string' || data.example.length > 500)) {
    errors.push('Example must be max 500 characters')
  }
  
  if (typeof data.dayIndex !== 'number' || data.dayIndex < 1) {
    errors.push('Day index must be positive number')
  }
  
  if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(data.difficulty)) {
    errors.push('Invalid difficulty level')
  }
  
  return { isValid: errors.length === 0, errors }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { word, definition, urduMeaning, example, dayIndex, difficulty } = data

    const { isValid, errors } = validateWordInput({ word, definition, urduMeaning, example, dayIndex, difficulty: difficulty || 'INTERMEDIATE' })
    
    if (!isValid) {
      return NextResponse.json(
        { error: errors.join('; ') },
        { status: 400 }
      )
    }

    const newWord = await prisma.wordOfDay.create({
      data: {
        word,
        definition,
        urduMeaning,
        example,
        dayIndex,
        difficulty: difficulty || 'INTERMEDIATE',
      },
    })

    return NextResponse.json(newWord)
  } catch (error) {
    console.error('Error creating word:', error)
    return NextResponse.json({ error: 'Failed to create word' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Invalid word ID' }, { status: 400 })
    }

    const wordExists = await prisma.wordOfDay.findUnique({
      where: { id },
    })
    
    if (!wordExists) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    await prisma.wordOfDay.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Word deleted successfully' })
  } catch (error) {
    console.error('Error deleting word:', error)
    return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 })
  }
}

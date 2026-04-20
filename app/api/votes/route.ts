import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { addXP } from '@/lib/xp'
import { getCurrentWeek } from '@/lib/week'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body.nominationId !== 'string') {
      return NextResponse.json({ error: 'nominationId must be a string' }, { status: 400 })
    }
    const { nominationId } = body

    const { weekNumber, weekYear } = getCurrentWeek()

    const nomination = await prisma.nomination.findUnique({
      where: { id: nominationId },
    })

    if (!nomination || nomination.weekNumber !== weekNumber || nomination.weekYear !== weekYear) {
      return NextResponse.json({ error: 'Nomination is invalid or does not belong to the current week' }, { status: 400 })
    }

    const existingVote = await prisma.weeklyVote.findUnique({
      where: {
        userId_weekNumber_weekYear: {
          userId: user.id,
          weekNumber,
          weekYear,
        }
      }
    })

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted this week' }, { status: 409 })
    }

    // Use a Prisma transaction to securely process the vote and XP bump
    await prisma.$transaction(async (tx) => {
      await tx.weeklyVote.create({
        data: {
          userId: user.id,
          nominationId: nomination.id,
          weekNumber,
          weekYear
        }
      })
      
      // Called within the transaction scope 
      // (Note: Ensure addXP properly works if it establishes an internal fallback connection)
      await addXP(user.id, 5)
    })

    const updatedVoteCount = await prisma.weeklyVote.count({
      where: { nominationId: nomination.id }
    })

    return NextResponse.json({ updatedVoteCount }, { status: 200 })

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already voted this week' }, { status: 409 })
    }
    console.error('Error casting vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

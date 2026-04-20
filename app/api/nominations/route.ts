import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { getCurrentWeek } from '@/lib/week'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const { weekNumber, weekYear } = getCurrentWeek()
    
    let hasVoted = false
    let hasNominated = false
    let userVotedNominationId: string | null = null

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })

      if (user) {
        const [vote, submissionCount] = await Promise.all([
          prisma.weeklyVote.findUnique({
            where: {
              userId_weekNumber_weekYear: {
                userId: user.id,
                weekNumber,
                weekYear
              }
            }
          }),
          prisma.nomination.count({
            where: { userId: user.id, weekNumber, weekYear }
          })
        ])

        if (vote) {
          hasVoted = true
          userVotedNominationId = vote.nominationId
        }
        hasNominated = submissionCount > 0
      }
    }

    const nominations = await prisma.nomination.findMany({
      where: {
        weekNumber,
        weekYear
      },
      include: {
        submittedBy: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { votes: true }
        }
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      }
    })

    return NextResponse.json({
      nominations,
      hasVoted,
      hasNominated,
      userVotedNominationId
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching nominations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

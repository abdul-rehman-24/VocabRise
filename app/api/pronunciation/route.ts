import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { addXP } from '@/lib/xp'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { word, score, xpEarned } = await request.json()

    // 1. Award XP
    if (xpEarned > 0) {
      await addXP(user.id, xpEarned)
    }

    // 2. Mark specific word as pronounced
    if (word) {
      // Find the collected word or saved word
      const savedWord = await prisma.savedWord.findFirst({
        where: { userId: user.id, word: word }
      })
      if (savedWord) {
        await prisma.savedWord.update({
          where: { id: savedWord.id },
          data: {
            hasPronounced: true,
            masteryLevel: Math.min(savedWord.masteryLevel + 1, 2)
          }
        })
      }

      const stats = await prisma.userStats.findUnique({ where: { userId: user.id } })
      if (stats) {
        const collectedWord = await prisma.collectedWord.findFirst({
          where: { userStatsId: stats.id, word: word }
        })
        if (collectedWord) {
          await prisma.collectedWord.update({
            where: { id: collectedWord.id },
            data: {
              hasPronounced: true,
              masteryLevel: Math.min(collectedWord.masteryLevel + 1, 2)
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, xpAwarded: xpEarned })
  } catch (error) {
    console.error('Pronunciation submission error:', error)
    return NextResponse.json({ error: 'Failed to record pronunciation results' }, { status: 500 })
  }
}

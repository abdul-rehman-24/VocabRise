import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const userStats = await prisma.userStats.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
            id: true,
          },
        },
      },
      orderBy: {
        totalXP: 'desc',
      },
      take: 10,
    })

    const leaderboard = userStats.map((stat, index) => ({
      rank: index + 1,
      userId: stat.user.id,
      name: stat.user.name || 'Anonymous',
      image: stat.user.image,
      totalXP: stat.totalXP,
      level: stat.level,
      wordsLearned: stat.wordsLearned,
    }))

    // If userId provided, fetch their rank
    let userRank = null
    if (userId && typeof userId === 'string' && userId.length > 10) {
      const userStat = await prisma.userStats.findUnique({
        where: { userId },
      })
      
      if (userStat) {
        const betterUsers = await prisma.userStats.count({
          where: { totalXP: { gt: userStat.totalXP } },
        })
        userRank = {
          rank: betterUsers + 1,
          totalXP: userStat.totalXP,
          level: userStat.level,
          wordsLearned: userStat.wordsLearned,
        }
      }
    }

    return NextResponse.json({ leaderboard, userRank })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

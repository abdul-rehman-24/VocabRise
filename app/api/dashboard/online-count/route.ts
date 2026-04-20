import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    // Count distinct users with recent activity (in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

    const recentlyActive = await prisma.user.count({
      where: {
        updatedAt: {
          gte: fifteenMinutesAgo
        }
      }
    })

    // Also count users with recent posts/comments for more accurate online count
    const usersWithPosts = await prisma.user.findMany({
      where: {
        OR: [
          {
            posts: {
              some: {
                createdAt: {
                  gte: fifteenMinutesAgo
                }
              }
            }
          },
          {
            comments: {
              some: {
                createdAt: {
                  gte: fifteenMinutesAgo
                }
              }
            }
          }
        ]
      },
      select: { id: true }
    })

    const uniqueActiveUsers = new Set(usersWithPosts.map(u => u.id))
    const count = Math.max(uniqueActiveUsers.size, Math.min(recentlyActive, 20))

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Online count API error:', error)
    return NextResponse.json({ count: 0 })
  }
}

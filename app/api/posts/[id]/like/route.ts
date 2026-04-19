import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const postId = id

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check existing like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    })

    // Check existing dislike
    const existingDislike = await prisma.dislike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    })

    let newLikesCount = post.likesCount
    let newDislikesCount = post.dislikesCount

    if (existingLike) {
      // Remove like
      await prisma.like.delete({ where: { id: existingLike.id } })
      newLikesCount -= 1
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: newLikesCount },
      })
      return NextResponse.json({ liked: false, disliked: false, likesCount: newLikesCount, dislikesCount: newDislikesCount })
    } else {
      // Add like
      await prisma.like.create({
        data: { userId: user.id, postId: postId },
      })
      newLikesCount += 1

      // Remove dislike if exists
      if (existingDislike) {
        await prisma.dislike.delete({ where: { id: existingDislike.id } })
        newDislikesCount -= 1
      }

      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: newLikesCount, dislikesCount: newDislikesCount },
      })

      return NextResponse.json({ liked: true, disliked: false, likesCount: newLikesCount, dislikesCount: newDislikesCount })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}

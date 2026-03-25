import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    const postId = params.id

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    })

    if (existingLike) {
      // Delete like and decrement count
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      })

      return NextResponse.json({ liked: false, likesCount: post.likesCount - 1 })
    } else {
      // Create like and increment count
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId,
        },
      })

      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      })

      return NextResponse.json({ liked: true, likesCount: post.likesCount + 1 })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}

import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: postId } = await params
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if word is already saved
    const existingSave = await prisma.savedWord.findFirst({
      where: {
        userId: user.id,
        word: post.word,
      },
    })

    if (existingSave) {
      // Remove save
      await prisma.savedWord.delete({
        where: { id: existingSave.id },
      })
      return NextResponse.json({ 
        saved: false,
        message: 'Word unsaved'
      })
    } else {
      // Add save
      await prisma.savedWord.create({
        data: {
          userId: user.id,
          word: post.word,
          definition: post.definition,
          urduMeaning: post.urduMeaning,
        },
      })
      return NextResponse.json({ 
        saved: true,
        message: 'Word saved'
      })
    }
  } catch (error) {
    console.error('Error saving word:', error)
    return NextResponse.json(
      { error: 'Failed to save word' },
      { status: 500 }
    )
  }
}

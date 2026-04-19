import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Full name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
        emailVerified: false,
      },
    })

    // Create auth provider record
    await prisma.authProvider.create({
      data: {
        userId: user.id,
        provider: 'email',
        providerAccountId: email,
      },
    })

    // Create user stats
    await prisma.userStats.create({
      data: {
        userId: user.id,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
      },
    })

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        message: 'Account created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            passwordHash: true,
          },
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await bcryptjs.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || profile?.name,
                image: user.image,
              },
            })

            // Create user stats
            await prisma.userStats.create({
              data: {
                userId: newUser.id,
                totalXP: 0,
                level: 1,
                currentStreak: 0,
              },
            })
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.role = (user as any).role || 'USER'
      }

      // Refresh role from DB on each JWT callback
      if (token.email && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true, name: true, image: true },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.name = dbUser.name
            token.image = dbUser.image
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || ''
        session.user.role = (token.role as 'USER' | 'ADMIN') || 'USER'
        session.user.email = (token.email as string) || ''
        session.user.name = (token.name as string) || ''
        session.user.image = (token.image as string) || null
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/dashboard`
    },
  },
}
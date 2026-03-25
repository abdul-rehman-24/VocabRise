import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export interface Post {
  id: string
  word: string
  definition: string
  example: string | null
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: Date
}

export interface WordOfDay {
  id: string
  word: string
  definition: string
  example: string
  difficulty: string
  createdAt: Date
}
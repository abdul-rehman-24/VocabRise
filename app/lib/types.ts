// App-specific types

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

export interface CollectedWord {
  id: string
  word: string
  definition: string
  category: string
  difficulty: number
  collectedAt: string
}
import { prisma } from '@/app/lib/prisma'

export function calculateNewLevel(totalXP: number): number {
  if (totalXP < 400) return 1
  if (totalXP < 700) return 2
  if (totalXP < 1000) return 3
  if (totalXP < 1500) return 4
  if (totalXP < 2000) return 5
  if (totalXP < 2500) return 6
  if (totalXP < 3000) return 7
  if (totalXP < 4000) return 8
  if (totalXP < 5000) return 9
  return 10
}

export async function addXP(userId: string, amount: number) {
  // Get or create user stats
  let stats = await prisma.userStats.findUnique({
    where: { userId }
  })

  if (!stats) {
    stats = await prisma.userStats.create({
      data: { userId }
    })
  }

  const newXP = (stats.totalXP || 0) + amount
  const newLevel = calculateNewLevel(newXP)

  // Update user stats
  const updatedStats = await prisma.userStats.update({
    where: { userId },
    data: { totalXP: newXP, level: newLevel }
  })

  return { newXP, newLevel }
}

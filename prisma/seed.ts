import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const words = [
    { word: 'Serendipity', definition: 'Finding something good without looking for it', urduMeaning: 'اتفاقی خوشگوار دریافت', example: 'Meeting her was pure serendipity', dayIndex: 1, difficulty: 'INTERMEDIATE' as const },
    { word: 'Resilient', definition: 'Able to recover quickly from difficulties', urduMeaning: 'مضبوط', example: 'She is a resilient person', dayIndex: 2, difficulty: 'INTERMEDIATE' as const },
    { word: 'Ephemeral', definition: 'Lasting for a very short time', urduMeaning: 'عارضی', example: 'Youth is ephemeral', dayIndex: 3, difficulty: 'INTERMEDIATE' as const },
    { word: 'Eloquent', definition: 'Fluent and persuasive in speaking or writing', urduMeaning: 'فصیح', example: 'He gave an eloquent speech', dayIndex: 4, difficulty: 'ADVANCED' as const },
    { word: 'Diligent', definition: 'Having steady and careful effort in work', urduMeaning: 'محنتی', example: 'She is a diligent student', dayIndex: 5, difficulty: 'BEGINNER' as const },
    { word: 'Ambiguous', definition: 'Open to more than one interpretation', urduMeaning: 'مبہم', example: 'His answer was ambiguous', dayIndex: 6, difficulty: 'ADVANCED' as const },
    { word: 'Tenacious', definition: 'Not giving up easily, determined', urduMeaning: 'ڈٹا رہنے والا', example: 'He was tenacious in his pursuit', dayIndex: 7, difficulty: 'ADVANCED' as const },
    { word: 'Benevolent', definition: 'Kind and generous towards others', urduMeaning: 'مہربان', example: 'She was a benevolent leader', dayIndex: 8, difficulty: 'INTERMEDIATE' as const },
    { word: 'Candid', definition: 'Truthful and straightforward in expression', urduMeaning: 'صاف گو', example: 'Please be candid with me', dayIndex: 9, difficulty: 'BEGINNER' as const },
    { word: 'Pragmatic', definition: 'Dealing with things sensibly and practically', urduMeaning: 'عملی', example: 'We need a pragmatic solution', dayIndex: 10, difficulty: 'ADVANCED' as const },
  ]

  for (const word of words) {
    await prisma.wordOfDay.upsert({
      where: { dayIndex: word.dayIndex },
      update: {},
      create: word,
    })
  }

  const testUsers = [
    { name: 'Ahmed Khan', email: 'ahmed@test.com', totalXP: 320, level: 4, wordsLearned: 32 },
    { name: 'Sara Ali', email: 'sara@test.com', totalXP: 280, level: 3, wordsLearned: 28 },
    { name: 'Usman Malik', email: 'usman@test.com', totalXP: 210, level: 3, wordsLearned: 21 },
    { name: 'Fatima Sheikh', email: 'fatima@test.com', totalXP: 150, level: 2, wordsLearned: 15 },
    { name: 'Ali Raza', email: 'ali@test.com', totalXP: 90, level: 1, wordsLearned: 9 },
  ]

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role as Role },
      create: { name: u.name, email: u.email, role: u.role as Role },
    })
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        totalXP: u.totalXP,
        level: u.level,
        wordsLearned: u.wordsLearned,
      },
    })
  }
  console.log('Test users seeded!')

  console.log('Seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

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
    { name: 'Ahmed Khan', email: 'ahmed@test.com', totalXP: 320, level: 4 },
    { name: 'Sara Ali', email: 'sara@test.com', totalXP: 280, level: 3 },
    { name: 'Usman Malik', email: 'usman@test.com', totalXP: 210, level: 3 },
    { name: 'Fatima Sheikh', email: 'fatima@test.com', totalXP: 150, level: 2 },
    { name: 'Ali Raza', email: 'ali@test.com', totalXP: 90, level: 1 },
  ]

  const collectedWordsData = [
    { word: 'Hello', definition: 'A greeting', category: 'common', difficulty: 1 },
    { word: 'Greeting', category: 'common', definition: 'A polite word or sign', difficulty: 1 },
    { word: 'Grateful', definition: 'Feeling thanks', category: 'common', difficulty: 2 },
    { word: 'Brave', definition: 'Courageous', category: 'common', difficulty: 2 },
    { word: 'Kind', definition: 'Showing good nature', category: 'common', difficulty: 1 },
    { word: 'Smart', definition: 'Intelligent', category: 'common', difficulty: 1 },
    { word: 'Happy', definition: 'Feeling joy', category: 'common', difficulty: 1 },
    { word: 'Eloquent', definition: 'Fluent and persuasive', category: 'advanced', difficulty: 4 },
    { word: 'Resilient', definition: 'Able to recover quickly', category: 'advanced', difficulty: 4 },
    { word: 'Candid', definition: 'Frank and honest', category: 'advanced', difficulty: 3 },
    { word: 'Ephemeral', definition: 'Lasting only a short time', category: 'gre', difficulty: 5 },
    { word: 'Serendipity', definition: 'Happy accident', category: 'gre', difficulty: 5 },
    { word: 'Melancholy', definition: 'Sad and pensive', category: 'gre', difficulty: 5 },
  ]

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: { name: u.name, email: u.email },
    })
    const stats = await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        totalXP: u.totalXP,
        level: u.level,
      },
    })

    // Add sample collected words
    const wordCount = Math.floor(Math.random() * (13 - 5 + 1)) + 5
    const wordsToAdd = collectedWordsData.slice(0, wordCount)
    for (const word of wordsToAdd) {
      try {
        await prisma.collectedWord.upsert({
          where: {
            userStatsId_word: {
              userStatsId: stats.id,
              word: word.word,
            },
          },
          update: {},
          create: {
            userStatsId: stats.id,
            word: word.word,
            definition: word.definition,
            category: word.category,
            difficulty: word.difficulty,
          },
        })
      } catch (error) {
        console.log(`Word ${word.word} already exists for user ${user.email}`)
      }
    }
  }
  console.log('Test users seeded!')

  console.log('Seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

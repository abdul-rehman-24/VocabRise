/*
  Warnings:

  - You are about to drop the column `wordsLearned` on the `user_stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_stats" DROP COLUMN "wordsLearned";

-- CreateTable
CREATE TABLE "collected_words" (
    "id" TEXT NOT NULL,
    "userStatsId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'advanced',
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collected_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collected_words_userStatsId_idx" ON "collected_words"("userStatsId");

-- CreateIndex
CREATE UNIQUE INDEX "collected_words_userStatsId_word_key" ON "collected_words"("userStatsId", "word");

-- AddForeignKey
ALTER TABLE "collected_words" ADD CONSTRAINT "collected_words_userStatsId_fkey" FOREIGN KEY ("userStatsId") REFERENCES "user_stats"("id") ON DELETE CASCADE;

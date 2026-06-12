/*
  Warnings:

  - Added the required column `status` to the `OutingParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('ACCEPTED', 'REFUSED');

-- AlterTable
ALTER TABLE "Outing" ADD COLUMN     "hasPoll" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OutingParticipant" ADD COLUMN "status" "ParticipationStatus" NOT NULL DEFAULT 'ACCEPTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "OutingPollOption" (
    "id" TEXT NOT NULL,
    "outingId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutingPollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutingPollVote" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OutingPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutingPollVote_optionId_userId_key" ON "OutingPollVote"("optionId", "userId");

-- AddForeignKey
ALTER TABLE "OutingPollOption" ADD CONSTRAINT "OutingPollOption_outingId_fkey" FOREIGN KEY ("outingId") REFERENCES "Outing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutingPollVote" ADD CONSTRAINT "OutingPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "OutingPollOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutingPollVote" ADD CONSTRAINT "OutingPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

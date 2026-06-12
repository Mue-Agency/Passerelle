/*
  Warnings:

  - Added the required column `lieu` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "baseGroupId" TEXT,
ADD COLUMN     "lieu" TEXT NOT NULL,
ADD COLUMN     "maxMembers" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "sessionNumber" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_baseGroupId_fkey" FOREIGN KEY ("baseGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

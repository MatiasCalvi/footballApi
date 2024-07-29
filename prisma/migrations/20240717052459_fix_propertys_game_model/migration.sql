/*
  Warnings:

  - You are about to drop the column `experienceP1` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `experienceP2` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "experienceP1",
DROP COLUMN "experienceP2",
ADD COLUMN     "experienceLose" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "experienceWin" INTEGER NOT NULL DEFAULT 0;

/*
  Warnings:

  - You are about to drop the `player_stats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_cardId_fkey";

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "assists" INTEGER DEFAULT 0,
ADD COLUMN     "assistsFromBand" INTEGER DEFAULT 0,
ADD COLUMN     "attackEfficiency" INTEGER DEFAULT 0,
ADD COLUMN     "ballRecovery" INTEGER DEFAULT 0,
ADD COLUMN     "bandRises" INTEGER DEFAULT 0,
ADD COLUMN     "controlBall" INTEGER DEFAULT 0,
ADD COLUMN     "defensiveSolidity" INTEGER DEFAULT 0,
ADD COLUMN     "distribution" INTEGER DEFAULT 0,
ADD COLUMN     "dribbling" INTEGER DEFAULT 0,
ADD COLUMN     "passPrecision" INTEGER DEFAULT 0,
ADD COLUMN     "polivalency" INTEGER DEFAULT 0,
ADD COLUMN     "speed" INTEGER DEFAULT 0,
ADD COLUMN     "strength" INTEGER DEFAULT 0;

-- DropTable
DROP TABLE "player_stats";

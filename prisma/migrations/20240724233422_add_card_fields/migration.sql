-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "isDefeated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDiscarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInPlay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playerState" INTEGER NOT NULL DEFAULT 100;

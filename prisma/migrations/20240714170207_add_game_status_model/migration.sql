/*
  Warnings:

  - You are about to drop the `private_rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room_participants` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ONGOING', 'COMPLETED', 'ABANDONED');

-- DropForeignKey
ALTER TABLE "private_rooms" DROP CONSTRAINT "private_rooms_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "room_participants" DROP CONSTRAINT "room_participants_roomId_fkey";

-- DropForeignKey
ALTER TABLE "room_participants" DROP CONSTRAINT "room_participants_userId_fkey";

-- DropTable
DROP TABLE "private_rooms";

-- DropTable
DROP TABLE "room_participants";

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "playerId" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER,
    "duration" INTEGER NOT NULL,
    "experienceP1" INTEGER NOT NULL DEFAULT 0,
    "experienceP2" INTEGER NOT NULL DEFAULT 0,
    "winnerId" INTEGER,
    "status" "GameStatus" NOT NULL DEFAULT 'ONGOING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_roomId_key" ON "games"("roomId");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `deck_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deck_of_cards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "deck_cards" DROP CONSTRAINT "DeckCard_cardId_fkey";

-- DropForeignKey
ALTER TABLE "deck_cards" DROP CONSTRAINT "DeckCard_deckId_fkey";

-- DropForeignKey
ALTER TABLE "deck_of_cards" DROP CONSTRAINT "deck_of_cards_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_collections" DROP CONSTRAINT "user_collections_deckOfCardsId_fkey";

-- DropTable
DROP TABLE "deck_cards";

-- DropTable
DROP TABLE "deck_of_cards";

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" SERIAL NOT NULL,
    "deckId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckOfCards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DeckOfCards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeckOfCards_userId_name_key" ON "DeckOfCards"("userId", "name");

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "DeckOfCards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckOfCards" ADD CONSTRAINT "DeckOfCards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collections" ADD CONSTRAINT "user_collections_deckOfCardsId_fkey" FOREIGN KEY ("deckOfCardsId") REFERENCES "DeckOfCards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

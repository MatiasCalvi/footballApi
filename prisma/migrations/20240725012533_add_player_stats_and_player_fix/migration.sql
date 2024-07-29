-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "life" INTEGER NOT NULL DEFAULT 100,
    "userName" TEXT NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "controlBall" INTEGER NOT NULL,
    "polivalency" INTEGER NOT NULL,
    "defensiveSolidity" INTEGER NOT NULL,
    "attackEfficiency" INTEGER NOT NULL,
    "distribution" INTEGER NOT NULL,
    "ballRecovery" INTEGER NOT NULL,
    "bandRises" INTEGER NOT NULL,
    "passPrecision" INTEGER NOT NULL,
    "assistsFromBand" INTEGER NOT NULL,
    "dribbling" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_userId_key" ON "players"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_cardId_key" ON "player_stats"("cardId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

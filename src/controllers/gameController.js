import { PrismaClient, GameStatus } from '@prisma/client';
import HTTP_STATUS from '../helpers/httpstatus.js';
import { createGameSchema, endGameSchema, surrenderSchema } from '../schemas/gameSchemas.js';
import { updateUserExperience } from '../utils/levelUpUsers.js';

const prisma = new PrismaClient();

const gameController = () => {
  const startGame = async (req, res) => {
    const { error } = createGameSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }
  
    const { roomId, player1Id, player2Id } = req.body;
  
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });
  
      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
      }
  
      const gameInProgressInRoom = await prisma.game.findFirst({
        where: { 
          roomId: roomId,
          status: GameStatus.ONGOING 
        },
      });
  
      if (gameInProgressInRoom) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'A game is already in progress in the room' });
      }
  
      const game = await prisma.game.create({
        data: {
          roomId: roomId,
          player1Id: player1Id,
          player2Id: player2Id,
          status: GameStatus.ONGOING,
          startedAt: new Date(),
          duration: 30,
          experienceLose: 70,
          experienceWin: 200
        },
      });
  
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'IN_GAME' },
      });
  
      res.status(HTTP_STATUS.CREATED).json(game);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to start the game', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };  
  
  const endGame = async (req, res) => {
    const { error } = endGameSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }
  
    const { gameId, winnerId, loserId } = req.body;
  
    try {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });
  
      if (!game) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Game not found' });
      }
  
      if (game.status === GameStatus.COMPLETED) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'Game has already been completed' });
      }
  
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          winnerId,
          status: GameStatus.COMPLETED,
          endedAt: new Date(),
        },
      });
  
      await updateUserExperience(winnerId, 200);
      await updateUserExperience(loserId, 20);
  
      await prisma.users.update({
        where: { id: winnerId },
        data: {
          gamesWon: { increment: 1 },
        },
      });
  
      await prisma.users.update({
        where: { id: loserId },
        data: {
          gamesLost: { increment: 1 },
        },
      });
  
      await prisma.room.update({
        where: { id: game.roomId },
        data: { status: 'ENDED' },
      });
  
      res.status(HTTP_STATUS.OK).json(updatedGame);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to end the game', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };  
  
  const surrenderGame = async (req, res) => {
    const { error } = surrenderSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }
  
    const { gameId, playerId } = req.body;
  
    try {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: { player1: true, player2: true },
      });
  
      if (!game) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Game not found' });
      }
  
      if (game.status === GameStatus.COMPLETED) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'Game has already been completed' });
      }
  
      const winnerId = game.player1Id === playerId ? game.player2Id : game.player1Id;
      const loserId = playerId;
  
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          winnerId,
          status: GameStatus.COMPLETED,
          endedAt: new Date(),
        },
      });
  
      await updateUserExperience(winnerId, 200);
      await updateUserExperience(loserId, 20);
  
      await prisma.users.update({
        where: { id: winnerId },
        data: {
          gamesWon: { increment: 1 },
        },
      });
  
      await prisma.users.update({
        where: { id: loserId },
        data: {
          gamesLost: { increment: 1 },
        },
      });
  
      await prisma.room.update({
        where: { id: game.roomId },
        data: { status: 'ENDED' },
      });
  
      const surrenderedPlayer = {
        id: game.player1Id === playerId ? game.player1.id : game.player2.id,
        userName: game.player1Id === playerId ? game.player1.userName : game.player2.userName,
      };
  
      res.status(HTTP_STATUS.OK).json({ ...updatedGame, surrenderedPlayer });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to surrender in the game', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };  
  
  return {
    startGame,
    endGame,
    surrenderGame,
  };
};

export default gameController;








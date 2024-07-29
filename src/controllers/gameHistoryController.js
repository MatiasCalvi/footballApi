import { PrismaClient } from '@prisma/client';
import HTTP_STATUS from '../helpers/httpstatus.js';
import { createGameHistorySchema } from '../schemas/gameHistorySchema.js';

const prisma = new PrismaClient();

const gameHistoryController = () => {
  const createGameHistory = async (req, res) => {
    const { error } = createGameHistorySchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }

    try {
      const gameHistory = await prisma.gameHistory.create({
        data: {
          ...req.body
        },
      });

      res.status(HTTP_STATUS.CREATED).json(gameHistory);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error creating game history', message: error.message });
    }
  };

  const getUserGameHistory = async (req, res) => {
    const { userId } = req.params;

    try {
      const gameHistory = await prisma.gameHistory.findMany({
        where: {
          userId: parseInt(userId),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          game: true,
        },
      });

      res.status(HTTP_STATUS.OK).json(gameHistory);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error fetching user game history', message: error.message });
    }
  };

  const getAllGameHistory = async (req, res) => {
    try {
      const gameHistory = await prisma.gameHistory.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
          game: true,
        },
      });

      res.status(HTTP_STATUS.OK).json(gameHistory);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error fetching all game history', message: error.message });
    }
  };

  return {
    createGameHistory,
    getUserGameHistory,
    getAllGameHistory,
  };
};

export default gameHistoryController;
import Joi from 'joi';

export const createGameHistorySchema = Joi.object({
  userId: Joi.number().integer().required(),
  gameId: Joi.number().integer().required(),
  duration: Joi.number().integer().required(),
  experienceGained: Joi.number().integer().required(),
  gameStatus: Joi.string().valid('ONGOING', 'COMPLETED', 'ABANDONED').required(),
});



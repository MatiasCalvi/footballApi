import Joi from 'joi';

export const createGameSchema = Joi.object({
  roomId: Joi.number().required(),
  player1Id: Joi.number().required(),
  player2Id: Joi.number().required(),
});

export const endGameSchema = Joi.object({
  gameId: Joi.number().required(),
  winnerId: Joi.number().required(),
  loserId: Joi.number().required(),
});

export const surrenderSchema = Joi.object({
  gameId: Joi.number().required(),
  playerId : Joi.number().required()
});



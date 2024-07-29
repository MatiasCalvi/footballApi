import Joi from 'joi';

export const createDeckSchema = Joi.object({
  name: Joi.string().required(),
  cardIds: Joi.array().items(Joi.number().integer()).max(30).required()
});

export const updateDeckSchema = Joi.object({
  name: Joi.string(), 
  cardIds: Joi.array().items(Joi.number().integer())
});

export const addCardToDeckSchema = Joi.object({
  cardId: Joi.number().integer().required()
});

export const removeCardFromDeckSchema = Joi.object({
  cardId: Joi.number().integer().required()
});
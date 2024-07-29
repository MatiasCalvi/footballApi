import Joi from 'joi';

export const createRoomSchema = Joi.object({
  privateRoom: Joi.boolean().required(),
  password: Joi.string().when('privateRoom', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
});

export const joinRoomSchema = Joi.object({
  roomId: Joi.number().integer().required(),
  password: Joi.string().optional(),
});

export const leaveRoomSchema = Joi.object({
  roomId: Joi.number().integer().positive().required(),
});

export const updateRoomSchema = Joi.object({
  password: Joi.optional(),
});
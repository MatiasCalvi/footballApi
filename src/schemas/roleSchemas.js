import Joi from 'joi';

export const createRoleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.number().integer().positive()).optional()
});

export const idRoleSchema = Joi.object({
  id: Joi.number().integer().positive()
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.number().integer().positive()).optional()
});

export const addPermissionSchema = Joi.object({
  permissionId: Joi.number().integer().positive().required()
});


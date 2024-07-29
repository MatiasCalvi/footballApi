import Joi from 'joi';

export const createPermissionSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  description: Joi.string().optional().max(255),
});

export const idPermissionSchema = Joi.object({
  id: Joi.number().integer().positive(),
});

export const updatePermissionSchema = Joi.object({
  name: Joi.string().optional().min(3).max(50),
  description: Joi.string().optional().max(255),
});

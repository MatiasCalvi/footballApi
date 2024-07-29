import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20).required(),
    rolId: Joi.number().integer().positive().default(1),
    status: Joi.string().valid('0', '1').default('1'),
    gamesWon: Joi.number().integer().min(0).default(0),
    gamesLost: Joi.number().integer().min(0).default(0),
    experienceGained: Joi.number().integer().min(0).default(0),
    playerLevel: Joi.number().integer().min(1).default(1)
});

export const idUserSchema = Joi.object({
    id: Joi.number().integer().positive(),
})

export const changeUserRoleSchema = Joi.object({
    rolId: Joi.number().integer().positive().required(),
});

export const updateUserSchema = Joi.object({
    name: Joi.string().optional(),
    lastname: Joi.string().optional(),
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).max(20).optional(),
    rolId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('0', '1').optional(),
    gamesWon: Joi.number().integer().min(0).optional(),
    gamesLost: Joi.number().integer().min(0).optional(),
    experienceGained: Joi.number().integer().min(0).optional(),
    playerLevel: Joi.number().integer().min(1).optional()
});

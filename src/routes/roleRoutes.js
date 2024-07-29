import express from 'express';
import roleController from '../controllers/roleController.js';
import { createRoleSchema, idRoleSchema, updateRoleSchema } from '../schemas/roleSchemas.js';
import { schemaValidator } from '../middlewares/schemaValidator.js';

const router = express.Router();
const { createRole, getRoles, getRoleById, updateRole, deleteRole } = roleController();

router.route('/')
    .get(getRoles)
    .post(schemaValidator(createRoleSchema),createRole);

router.route('/:id')
    .get(schemaValidator(idRoleSchema), getRoleById)
    .delete(schemaValidator(idRoleSchema), deleteRole)
    .put(schemaValidator(updateRoleSchema), updateRole);

export default router;

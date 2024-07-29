import express from 'express';
import permissionController from '../controllers/permissionController.js';
import { createPermissionSchema, idPermissionSchema, updatePermissionSchema } from '../schemas/permissionSchemas.js';
import { schemaValidator } from '../middlewares/schemaValidator.js';

const router = express.Router();
const { createPermission, getPermissions, getPermissionById, updatePermission, deletePermission } = permissionController();

router.route('/')
    .get(getPermissions)
    .post(schemaValidator(createPermissionSchema),createPermission);

router.route('/:id')
    .get(schemaValidator(idPermissionSchema), getPermissionById)
    .delete(schemaValidator(idPermissionSchema), deletePermission)
    .put(schemaValidator(updatePermissionSchema), updatePermission);

export default router;
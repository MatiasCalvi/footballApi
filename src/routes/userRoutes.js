import express, { Router } from 'express';
import verifyMiddleware from '../middlewares/verifyMiddleware.js';
import { schemaValidator } from '../middlewares/schemaValidator.js';
import { createUserSchema, idUserSchema, updateUserSchema, changeUserRoleSchema } from '../schemas/userSchemas.js';
import userController  from '../controllers/userController.js';
import checkAdminMiddleware from '../middlewares/checkAdminMiddleware.js';

const router = express.Router();
const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser, refreshToken, disableUser, changeUserRole, enableUser } = userController();

router.route('/')
  .get(getUsers)
  .post(schemaValidator(createUserSchema), createUser)
  
router.route('/refresh-token')
  .post(refreshToken);

router.route('/:id')
  .get(schemaValidator(idUserSchema), getUserById)
  .delete(verifyMiddleware,schemaValidator(idUserSchema), deleteUser)
  .put(verifyMiddleware, schemaValidator(updateUserSchema), updateUser)

router.route('/changeUserRol/:id').put(verifyMiddleware, checkAdminMiddleware, schemaValidator(changeUserRoleSchema), changeUserRole);

router.put('/disable/:id', verifyMiddleware,checkAdminMiddleware, disableUser);
router.put('/enable/:id', verifyMiddleware,checkAdminMiddleware, enableUser);
  
router.route('/login')
  .post(loginUser); 

export default router;






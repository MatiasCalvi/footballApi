import express from 'express';
import gameHistoryController from '../controllers/gameHistoryController.js';
import checkAdminMiddleware from '../middlewares/checkAdminMiddleware.js';
import { createGameHistorySchema } from '../schemas/gameHistorySchema.js'
import { schemaValidator } from '../middlewares/schemaValidator.js';

const router = express.Router();
const {createGameHistory,getUserGameHistory,getAllGameHistory} = gameHistoryController();

router.get('/',checkAdminMiddleware, getAllGameHistory)
    .post(schemaValidator(createGameHistorySchema),createGameHistory);

router.get('/user/:userId', getUserGameHistory);

export default router;

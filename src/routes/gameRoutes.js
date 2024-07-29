import express from 'express';
import { schemaValidator } from '../middlewares/schemaValidator.js';
import { createGameSchema, endGameSchema, surrenderSchema } from '../schemas/gameSchemas.js';
import gameController from '../controllers/gameController.js';

const router = express.Router();
const { startGame, endGame, surrenderGame } = gameController();

router.post('/start', schemaValidator(createGameSchema), startGame);
router.post('/end', schemaValidator(endGameSchema), endGame);
router.post('/surrender', schemaValidator(surrenderSchema), surrenderGame);

export default router;

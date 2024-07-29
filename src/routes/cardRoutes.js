import express from 'express';
import { schemaValidator } from '../middlewares/schemaValidator.js';
import { createCardSchema, updateCardSchema } from '../schemas/cardSchema.js';
import checkAdminMiddleware from '../middlewares/checkAdminMiddleware.js';
import cardController from '../controllers/cardController.js';

const router = express.Router();
const { createCard, getAllCards, getCardById, updateCard, deleteCard } = cardController();

router.route('/')
    .get(getAllCards)
    .post(checkAdminMiddleware,schemaValidator(createCardSchema), createCard);         

router.route('/:cardId')
    .get(getCardById)
    .put(checkAdminMiddleware,schemaValidator(updateCardSchema), updateCard)
    .delete(checkAdminMiddleware,deleteCard);

export default router;
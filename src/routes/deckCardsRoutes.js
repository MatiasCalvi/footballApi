import express from 'express';
import { schemaValidator } from '../middlewares/schemaValidator.js';
import { createDeckSchema,addCardToDeckSchema, removeCardFromDeckSchema, updateDeckSchema } from '../schemas/deckCardsSchema.js';
import deckCardsController from '../controllers/deckCardsController.js';

const router = express.Router();
const { createDeckForUser,createCustomDeck, getDecksForUser, getDeckById, addCardToDeck,removeCardFromDeck, updateDeck, deleteDeck} = deckCardsController();

router.post('/', createDeckForUser);

router.post('/createCustomDeck',schemaValidator(createDeckSchema), createCustomDeck);

router.put('/addCardToDesk/:deckId',schemaValidator(addCardToDeckSchema), addCardToDeck);

router.put('/removeCardToDesk/:deckId',schemaValidator(removeCardFromDeckSchema), removeCardFromDeck);         

router.get('/decksForUser',getDecksForUser);

router.route('/:deckCardsId')
    .get(getDeckById)
    .put(schemaValidator(updateDeckSchema), updateDeck)
    .delete(deleteDeck);

export default router;
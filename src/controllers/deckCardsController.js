import { PrismaClient } from '@prisma/client';
import HTTP_STATUS from '../helpers/httpstatus.js';
import { createDeckSchema, addCardToDeckSchema, removeCardFromDeckSchema, updateDeckSchema } from '../schemas/deckCardsSchema.js';

const prisma = new PrismaClient();

const deckCardsController = () => {
    const createDeckForUser = async (req, res) => {
        const userId = req.user.id;
        try {
            const existingDecks = await prisma.deckOfCards.findMany({ where: { userId: parseInt(userId) } });
            if (existingDecks.length >= 3) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "User can only have up to 3 decks" });
            }

            const cards = await prisma.card.findMany();
            if (cards.length < 30) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Not enough cards in the database" });
            }
            const randomCards = cards.sort(() => 0.5 - Math.random()).slice(0, 30);

            const deckName = `MY DECK CARDS ${existingDecks.length + 1}`; 

            const deck = await prisma.deckOfCards.create({
                data: {
                    name: deckName,
                    userId: parseInt(userId),
                    cards: {
                        create: randomCards.map(card => ({ cardId: card.id }))
                    }
                },
                include: {
                    cards: true
                }
            });

            await addDeckToUserCollection({ params: { userId: userId }, body: { deckId: deck.id } });

            res.status(HTTP_STATUS.CREATED).json(deck);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const getDecksForUser = async (req, res) => {
        const userId = req.user.id;
        try {
            console.log(userId)
            const decks = await prisma.deckOfCards.findMany({
                where: { userId: parseInt(userId) },
                include: {
                    cards: {
                        include: {
                            Card: true
                        }
                    }
                }
            });
            res.status(HTTP_STATUS.OK).json(decks);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const getDeckById = async (req, res) => {
        const {deckCardsId} = req.params;
        try {
            console.log(req.params);
            const deck = await prisma.deckOfCards.findUnique({
                where: { id: parseInt(deckCardsId) },
                include: {
                    cards: {
                        include: {
                            Card: true
                        }
                    }
                }
            });
            if (deck) {
                res.status(HTTP_STATUS.OK).json(deck);
            } else {
                res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Deck not found" });
            }
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const createCustomDeck = async (req, res) => {
        const { error: validationError } = createDeckSchema.validate(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
        }
        
        const { name, cardIds } = req.body;
        const userId = req.user.id;
    
        try {
            const userExists = await prisma.users.findUnique({
                where: { id: parseInt(userId) },
            });
            if (!userExists) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User not found" });
            }
    
            const existingDecks = await prisma.deckOfCards.findMany({
                where: { userId: parseInt(userId) },
            });
            if (existingDecks.length >= 3) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "User can only have up to 3 decks" });
            }
    
            if (!Array.isArray(cardIds) || cardIds.length > 30) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Deck can only have up to 30 cards" });
            }
    
            const cardIdsArray = [...new Set(cardIds.map(id => parseInt(id, 10)))];
    
            const validCards = await prisma.card.findMany({
                where: { id: { in: cardIdsArray } },
            });
    
            const validCardIdsSet = new Set(validCards.map(card => card.id));
    
            const invalidCardIds = cardIdsArray.filter(id => !validCardIdsSet.has(id));
            if (invalidCardIds.length > 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `The following card IDs are invalid: ${invalidCardIds.join(', ')}` });
            }
    
            const deck = await prisma.deckOfCards.create({
                data: {
                    name,
                    userId: parseInt(userId),
                    cards: {
                        create: cardIdsArray.map(cardId => ({ cardId })),
                    },
                },
                include: {
                    cards: true,
                },
            });
    
            await addDeckToUserCollection({ params: { userId }, body: { deckId: deck.id } });
    
            res.status(HTTP_STATUS.CREATED).json(deck);
        } catch (error) {
            console.error("Error creating deck:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };
                           
    const addCardToDeck = async (req, res) => {
        const { error: validationError } = addCardToDeckSchema.validate(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
        }
        const { cardId } = req.body;
        const { deckId } = req.params; 
        const userId = req.user.id; 
    
        try {
            const deck = await prisma.deckOfCards.findUnique({
                where: { id: parseInt(deckId) },
                include: { cards: true }
            });
    
            if (!deck) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Deck not found" });
            }
    
            if (deck.userId !== parseInt(userId)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "User does not own this deck" });
            }
    
            if (deck.cards.length >= 30) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Deck already has 30 cards" });
            }
    
            const cardExists = deck.cards.some(card => card.cardId === parseInt(cardId));
            if (cardExists) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Card already exists in the deck" });
            }
    
            await prisma.deckCard.create({
                data: {
                    deckId: parseInt(deckId),
                    cardId: parseInt(cardId)
                }
            });
    
            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };           
    
    const removeCardFromDeck = async (req, res) => {
        const { error: validationError } = removeCardFromDeckSchema.validate(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
        }
        const { cardId } = req.body;
        const { deckId } = req.params; 
        const userId = req.user.id; 
    
        try {
            const deck = await prisma.deckOfCards.findUnique({
                where: { id: parseInt(deckId) },
                include: { cards: true }
            });
    
            if (!deck) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Deck not found" });
            }
    
            if (deck.userId !== parseInt(userId)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "User does not own this deck" });
            }
    
            const cardExists = deck.cards.some(card => card.cardId === parseInt(cardId));
            if (!cardExists) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Card does not exist in the deck" });
            }
    
            await prisma.deckCard.deleteMany({
                where: {
                    deckId: parseInt(deckId),
                    cardId: parseInt(cardId)
                }
            });
    
            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };                            

    const updateDeck = async (req, res) => {
        const { error: validationError } = updateDeckSchema.validate(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
        }
    
        const { deckCardsId } = req.params;
        const { name, cardIds } = req.body;
    
        try {
            const deck = await prisma.deckOfCards.findUnique({
                where: { id: parseInt(deckCardsId) },
                include: { cards: true }
            });
    
            if (!deck) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Deck not found" });
            }
    
            const deckUpdates = {};
            if (name) {
                deckUpdates.name = name;
            }
    
            if (cardIds) {
                const updatedCardIds = cardIds.map(id => parseInt(id));
    
                const cards = await prisma.card.findMany({
                    where: { id: { in: updatedCardIds } }
                });
    
                if (cards.length !== updatedCardIds.length) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "One or more card IDs are invalid" });
                }
    
                await prisma.$transaction(async (prisma) => {
                    await prisma.deckCard.deleteMany({
                        where: { deckId: parseInt(deckCardsId) }
                    });
    
                    const deckCardData = updatedCardIds.map(cardId => ({
                        deckId: parseInt(deckCardsId),
                        cardId
                    }));
    
                    await prisma.deckCard.createMany({
                        data: deckCardData
                    });
                });
            }
    
            if (Object.keys(deckUpdates).length > 0) {
                await prisma.deckOfCards.update({
                    where: { id: parseInt(deckCardsId) },
                    data: deckUpdates
                });
            }
    
            const updatedDeck = await prisma.deckOfCards.findUnique({
                where: { id: parseInt(deckCardsId) },
                include: { cards: true }
            });
    
            res.status(HTTP_STATUS.OK).json(updatedDeck);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };                                          

    const deleteDeck = async (req, res) => {
        const { deckCardsId } = req.params;
        try {
            await removeDeckFromUserCollection({ params: { deckCardsId } });

            await prisma.deckOfCards.delete({
                where: { id: parseInt(deckCardsId) }
            });

            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const addDeckToUserCollection = async ({ params, body }) => {
        const { userId } = params;
        const { deckId } = body;
    
        try {
            const deck = await prisma.deckOfCards.findUnique({
                where: { id: parseInt(deckId) }
            });
    
            if (!deck) {
                throw new Error("Deck not found");
            }
    
            if (deck.userId !== parseInt(userId)) {
                throw new Error("User does not own this deck");
            }
    
            await prisma.userCollection.create({
                data: {
                    userId: parseInt(userId),
                    deckOfCardsId: parseInt(deckId) 
                }
            });
        } catch (error) {
            throw new Error(error.message);
        }
    };    

    const removeDeckFromUserCollection = async ({ params }) => {
        const { deckCardsId } = params;
        try {
            await prisma.userCollection.deleteMany({
                where: { deckOfCardsId: parseInt(deckCardsId) }  
            });
        } catch (error) {
            throw new Error(error.message);
        }
    };    

    return {
        createDeckForUser,
        getDecksForUser,
        getDeckById,
        createCustomDeck,
        addCardToDeck,
        removeCardFromDeck,
        updateDeck,
        deleteDeck,
    };
};

export default deckCardsController;
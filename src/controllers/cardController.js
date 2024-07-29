import { PrismaClient } from '@prisma/client';
import HTTP_STATUS from '../helpers/httpstatus.js';
import { createCardSchema, updateCardSchema } from '../schemas/cardSchema.js';

const prisma = new PrismaClient();

const cardController = () => {
    const createCard = async (req, res) => {
        const { error: validationError } = createCardSchema.validate(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
        }

        try {
            const card = await prisma.card.create({
                data:{ 
                    ...req.body,
                    name : 'MI MAZO',
                    updatedAt : null
                } 
            });
            res.status(HTTP_STATUS.CREATED).json(card);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const getAllCards = async (req, res) => {
        try {
            const cards = await prisma.card.findMany();
            res.status(HTTP_STATUS.OK).json(cards);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const getCardById = async (req, res) => {
        const { cardId } = req.params; 
        try {
            const card = await prisma.card.findUnique({
                where: { id: parseInt(cardId, 10) } 
            });
            if (card) {
                res.status(HTTP_STATUS.OK).json(card);
            } else {
                res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Card not found" });
            }
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const updateCard = async (req, res) => {
        const { error: validationError } = updateCardSchema.validate(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
        }

        const { cardId } = req.params;
        try {
            const card = await prisma.card.update({
                where: { id: parseInt(cardId, 10) }, 
                data: req.body
            });
            res.status(HTTP_STATUS.OK).json(card);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    const deleteCard = async (req, res) => {
        const { cardId } = req.params; 
        try {
            await prisma.card.delete({
                where: { id: parseInt(cardId, 10) }
            });
            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    };

    return {
        createCard,
        getAllCards,
        getCardById,
        updateCard,
        deleteCard
    };
};

export default cardController;



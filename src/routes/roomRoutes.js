import express from 'express';
import { schemaValidator } from '../middlewares/schemaValidator.js';
import { createRoomSchema, joinRoomSchema, leaveRoomSchema, updateRoomSchema } from '../schemas/roomSchemas.js';
import roomController from '../controllers/roomController.js';

const router = express.Router();
const { getRoomDetails, createRoom, joinRoom, leaveRoom, deleteRoom, updateRoom, kickPlayer } = roomController();

router.post('/', schemaValidator(createRoomSchema), createRoom);
router.post('/join', schemaValidator(joinRoomSchema), joinRoom);
router.post('/leave',schemaValidator(leaveRoomSchema), leaveRoom);

router.route('/:roomId')
    .get(getRoomDetails)
    .put(schemaValidator(updateRoomSchema), updateRoom)
    .delete(deleteRoom)

router.put('/kick-player/:id',kickPlayer);

export default router;

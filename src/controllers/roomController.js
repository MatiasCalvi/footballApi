import { PrismaClient } from '@prisma/client';
import HTTP_STATUS from '../helpers/httpstatus.js';
import { createRoomSchema, joinRoomSchema, leaveRoomSchema, updateRoomSchema } from '../schemas/roomSchemas.js';

const prisma = new PrismaClient();

const roomController = () => {
  const getRoomDetails = async (req, res) => {
    const roomId = parseInt(req.params.roomId);
  
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          owner: true,
          player: true,
        },
      });
  
      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
      }

      const sanitizedRoom = {
        ...room,
        owner: {
          ...room.owner,
          password: undefined
        },
        player: room.player ? {
          ...room.player,
          password: undefined
        } : null
      };
  
      res.status(HTTP_STATUS.OK).json(sanitizedRoom);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve room details', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };    

  const createRoom = async (req, res) => {
    const { error } = createRoomSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }
  
    const { privateRoom, password } = req.body;
    const ownerId = req.user.id; 
  
    try {
      const existingRoom = await prisma.room.findFirst({
        where: {
          ownerId: ownerId,
          isActive: true,
        },
      });
  
      if (existingRoom) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'User already has an active room. Please delete the existing room before creating a new one.' });
      }
  
      const room = await prisma.room.create({
        data: {
          ownerId: ownerId,
          isPrivate: privateRoom,
          password,
          isActive: true,
        },
      });
  
      res.status(HTTP_STATUS.CREATED).json(room);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error creating room', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };   
  
  const joinRoom = async (req, res) => {
    const { error } = joinRoomSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }
  
    const { roomId, password } = req.body;
    const playerId = req.user.id; 
  
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });
  
      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
      }

      if (room.isPrivate && password == null) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Enter the password to enter the room' });
      }
      else if (room.isPrivate && room.password !== password) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Incorrect password' });
      }
  
      if (room.playerId && room.playerId !== room.ownerId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'The room is already full' });
      }
  
      const player = await prisma.users.findUnique({
        where: { id: playerId },
      });
  
      if (!player) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Player not found' });
      }
  
      if (room.ownerId === playerId) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'Owner cannot join as player' });
      }
  
      const existingRoom = await prisma.room.findFirst({
        where: {
          playerId: playerId,
          isActive: true,
        },
      });
  
      if (existingRoom) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'User is already in another active room. Please leave the current room before joining a new one.' });
      }
  
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          playerId: playerId,
        },
      });
  
      res.status(HTTP_STATUS.OK).json(updatedRoom);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to join room', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };    
  
  const leaveRoom = async (req, res) => {
    const { roomId } = req.body;
    const playerId = req.user.id;
  
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });
  
      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
      }
  
      const isPlayerLeaving = room.playerId === playerId;
      const isOwnerLeaving = room.ownerId === playerId;
  
      if (isPlayerLeaving) {
        await prisma.room.update({
          where: { id: roomId },
          data: {
            playerId: null,
          },
        });
      }
  
      if (isOwnerLeaving) {
        await prisma.room.update({
          where: { id: roomId },
          data: {
            ownerId: null,
          },
        });
      }
  
      const remainingPlayers = isPlayerLeaving || isOwnerLeaving;
  
      if (!remainingPlayers) {
        await prisma.room.delete({
          where: { id: roomId },
        });
  
        res.status(HTTP_STATUS.NO_CONTENT).json({ message: 'Room deleted as there are no users left' });
      } else {
        res.status(HTTP_STATUS.OK).json({ message: 'Player has left the room' });
      }
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error when leaving the room', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  };    
               
  const deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    const playerId = req.user.id;

    try {
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomId) },
            include: {
                games: true, 
                player: true 
            }
        });

        if (!room) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
        }

        if (room.ownerId !== playerId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'You are not the owner of the room' });
        }

        if (room.games.length > 0) {
            await prisma.game.deleteMany({
                where: { roomId: parseInt(roomId) }
            });
        }

        await prisma.room.delete({
            where: { id: parseInt(roomId) }
        });

        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error deleting room', message: error.message });
      } finally {
          await prisma.$disconnect();
      }
  };

  const kickPlayer = async (req, res) => {
    const { roomId } = req.body;
    const playerId = req.user.id;

    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
        }

        if (room.ownerId !== playerId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'You are not authorized to kick players from this room' });
        }

        if (room.playerId) {
            await prisma.room.update({
                where: { id: roomId },
                data: {
                    playerId: null,
                },
            });
            return res.status(HTTP_STATUS.OK).json({ message: 'Player kicked from the room' });
        }

        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Player not found in the room' });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to kick player from room', message: error.message });
    }finally {
      await prisma.$disconnect();
    }
  };

  const updateRoom = async (req, res) => {
    const { error } = updateRoomSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details });
    }

    const { roomId } = req.params;
    const { password} = req.body;

    try {
      const room = await prisma.room.findUnique({
        where: { id: parseInt(roomId) },
      });

      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
      }

      let dataToUpdate = {};

      if (password !== undefined) {
        dataToUpdate.password = password;
        dataToUpdate.isPrivate = true;
      }
      else{
        dataToUpdate.password = null;
        dataToUpdate.isPrivate = false;
      }

      const updatedRoom = await prisma.room.update({
        where: { id: parseInt(roomId) },
        data: dataToUpdate,
      });

      res.status(HTTP_STATUS.OK).json(updatedRoom);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update room details', message: error.message });
    }finally {
      await prisma.$disconnect();
    }
  };

  return {
    getRoomDetails,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    kickPlayer,
    updateRoom,
  };
};

export default roomController;





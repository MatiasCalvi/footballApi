import { PrismaClient } from '@prisma/client';
import { encrypt, verified } from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken } from '../utils/authUtils.js'; 
import { ADMIN_ROL_ID } from '../utils/roleUtils.js';
import { createUserSchema, idUserSchema, updateUserSchema, changeUserRoleSchema } from '../schemas/userSchemas.js';
import HTTP_STATUS from '../helpers/httpstatus.js';
import { verifyToken } from '../utils/jwtUtils.js';

const prisma = new PrismaClient();

const userController = () => {
  const createUser = async (req, res, next) => {
    const { error: validationError } = createUserSchema.validate(req.body);
    if (validationError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
    }

    const { name, lastname, userName, email, password } = req.body;

    try {
        const existingUsuario = await prisma.users.findUnique({
            where: { email }
        });

        if (existingUsuario) {
            return res.status(HTTP_STATUS.CONFLICT).json({ error: 'Email is already in use' });
        }

        const rolUsuario = await prisma.role.findFirst({
            where: { name: 'user' }
        });

        const hashedPassword = await encrypt(password);
        const usuario = await prisma.users.create({
            data: {
                name,
                lastname,
                userName,
                email,
                password: hashedPassword,
                rolId: rolUsuario.id,
                status: '1', 
                gamesWon: 0, 
                gamesLost: 0, 
                experienceGained: 0,
                playerLevel: 1, 
                createdAt: new Date(),
                updatedAt: null
            },
        });

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'User created successfully',
            data: usuario,
        });
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
  };

  const getUsers = async (req, res, next) => {
    try {
      const users = await prisma.users.findMany();
      res.json(users);
    } catch (error) {
      next(error); 
    }
    finally {
      await prisma.$disconnect();
    } 
  };

  const getUserById = async (req, res, next) => {
    const { error } = idUserSchema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
    }
    try {
      const user = await prisma.users.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      next(error); 
    }
    finally {
      await prisma.$disconnect();
    } 
  };

  const updateUser = async (req, res, next) => {
    const { error: paramsError } = idUserSchema.validate(req.params);
    if (paramsError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: paramsError.details[0].message });
    }
    const { rolId,email,password, ...restBody } = req.body;
    const { error: bodyError } = updateUserSchema.validate(restBody);
    if (bodyError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: bodyError.details[0].message });
    }
  
    try {
      const userId = parseInt(req.params.id);

      if (req.user.id !== userId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied. You can only update your own information.' });
      }

      const userExist = await prisma.users.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      
      if (!userExist) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
      }
      const userData = { ...restBody };
  
      if (password) {
        userData.password = await encrypt(req.body.password);
      }
      
      if (email) {
        const existingUser = await prisma.users.findUnique({
          where: { email }
        });
  
        if (existingUser && existingUser.id !== userId) {
          return res.status(HTTP_STATUS.CONFLICT).json({ error: 'Email is already in use.' });
        }
        userData.email = email;
      }

      if (rolId !== undefined) {
        if (req.user.rolId !== ADMIN_ROL_ID) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied. Admin role is required to update the roleId field.' });
        }
        userData.rolId = rolId;
      }
  
      const user = await prisma.users.update({
        where: { id: userId },
        data: userData
      });
  
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
    finally {
      await prisma.$disconnect();
    } 
  };

  const deleteUser = async (req, res, next) => {
    const { error } = idUserSchema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
    }

    try {
      const user = await prisma.users.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
      }
      await prisma.users.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error); 
    }
    finally {
      await prisma.$disconnect();
    } 
  };

  const loginUser = async (req, res, next) => { 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Email and password are required.' });
    }

    try {
      const user = await prisma.users.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found.' });
      }

      const isPasswordValid = await verified(password, user.password); 

      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Incorrect password.' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({ accessToken, refreshToken, message: 'Successful login' });
    } catch (error) {
      next(error); 
    }
    finally {
      await prisma.$disconnect();
    } 
  };

  const refreshToken = async (req, res, next) => {
    const refreshToken = req.headers.authorization?.split(' ')[1];
  
    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Refresh token is required.' });
    }
  
    try {
      const decodedToken = verifyToken(refreshToken);
  
      if (decodedToken.error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid refresh token.' });
      }
  
      const user = await prisma.users.findUnique({
        where: { id: decodedToken.id }
      });
  
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found.' });
      }
  
      const accessToken = generateAccessToken(user);
  
      res.json({ accessToken, message: 'Access token refreshed successfully.' });
    } catch (error) {
      next(error);
    }
  };  

  const disableUser = async (req, res, next) => {
    const userId = parseInt(req.params.id);
  
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });
  
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found.' });
      }
  
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          status: '0'
        }
      });
  
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  const enableUser = async (req, res, next) => {
    const userId = parseInt(req.params.id);
  
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });
  
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found.' });
        }
  
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                status: '1'
            }
        });
  
        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
  };

  const changeUserRole = async (req, res, next) => {
    const { error: bodyError } = changeUserRoleSchema.validate(req.body);
    if (bodyError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: bodyError.details[0].message });
    }
  
    const { id } = req.params;
    const { rolId } = req.body; 

    try {
        const userId = parseInt(id);
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found.' });
        }

        const role = await prisma.role.findUnique({
            where: { id: rolId }
        });

        if (!role) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Role not found.' });
        }
      
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                rolId
            }
        });

        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    } 
  };

  return {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    refreshToken,
    enableUser,
    disableUser,
    changeUserRole
  };
};

export default userController;












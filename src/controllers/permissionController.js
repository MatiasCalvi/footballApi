import { PrismaClient } from '@prisma/client';
import { createPermissionSchema, idPermissionSchema, updatePermissionSchema } from '../schemas/permissionSchemas.js';
import HTTP_STATUS from '../helpers/httpstatus.js';

const prisma = new PrismaClient();

const permissionController = () => {
  const createPermission = async (req, res, next) => {
    const { error: validationError } = createPermissionSchema.validate(req.body);
    if (validationError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
    }

    try {
      const permission = await prisma.permissions.create({
        data: {
          ...req.body
        }
      });

      res.status(HTTP_STATUS.CREATED).json({ data: permission, message: 'Permission created successfully' });
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const getPermissions = async (req, res, next) => {
    try {
      const permissions = await prisma.permissions.findMany();
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  };

  const getPermissionById = async (req, res, next) => {
    const { error } = idPermissionSchema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
    }

    try {
      const permission = await prisma.permissions.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      if (!permission) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Permission not found' });
      }
      res.json(permission);
    } catch (error) {
      next(error);
    }
  };

  const updatePermission = async (req, res, next) => {
    const { error: paramsError } = idPermissionSchema.validate(req.params);
    if (paramsError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: paramsError.details[0].message });
    }

    const { error: bodyError } = updatePermissionSchema.validate(req.body);
    if (bodyError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: bodyError.details[0].message });
    }

    try {
      const permission = await prisma.permissions.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...req.body
        }
      });

      res.json({ data: permission, message: 'Permission updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  const deletePermission = async (req, res, next) => {
    const { error } = idPermissionSchema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
    }

    try {
      await prisma.permissions.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
  };
};

export default permissionController;
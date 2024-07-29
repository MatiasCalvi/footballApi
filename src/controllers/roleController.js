import { PrismaClient } from '@prisma/client';
import { createRoleSchema, idRoleSchema, updateRoleSchema, addPermissionSchema } from '../schemas/roleSchemas.js';
import HTTP_STATUS from '../helpers/httpstatus.js';

const prisma = new PrismaClient();

const checkAndCreatePermissions = async (permissions) => {
  const createdPermissions = [];
  for (const permission of permissions) {
    let existingPermission = await prisma.permissions.findUnique({
      where: { id: permission.id }
    });

    if (!existingPermission) {
      existingPermission = await prisma.permissions.create({
        data: { name: permission.name, description: permission.description }
      });
    }
    createdPermissions.push(existingPermission);
  }
  return createdPermissions;
};

export const roleController = () => {
  const createRole = async (req, res, next) => {
    const { error: validationError } = createRoleSchema.validate(req.body);
    if (validationError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError.details[0].message });
    }

    const { name, description, permissions } = req.body;

    try {
      const permissionList = await checkAndCreatePermissions(permissions);
      const role = await prisma.role.create({
        data: {
          name,
          description,
          rolesAndPermissions: {
            create: permissionList.map(p => ({ permissionId: p.id }))
          }
        }
      });

      res.status(HTTP_STATUS.CREATED).json({ data: role, message: 'Role created successfully' });
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  };

  const getRoles = async (req, res, next) => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          rolesAndPermissions: {
            include: {
              Permissions: true
            }
          }
        }
      });
      const transformedRoles = roles.map(role => ({
        ...role,
        permissions: role.rolesAndPermissions.map(rp => rp.Permissions)
      }));

      res.json(transformedRoles);
    } catch (error) {
      next(error);
    }
  };

  const getRoleById = async (req, res, next) => {
    const { error } = idRoleSchema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
    }

    try {
      const role = await prisma.role.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          rolesAndPermissions: {
            include: {
              Permissions: true
            }
          }
        }
      });

      if (!role) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Role not found' });
      }
      const transformedRole = {
        ...role,
        permissions: role.rolesAndPermissions.map(rp => rp.Permissions)
      };

      res.json(transformedRole);
    } catch (error) {
      next(error);
    }
  };

  const updateRole = async (req, res, next) => {
    const { error: paramsError } = idRoleSchema.validate(req.params);
    if (paramsError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: paramsError.details[0].message });
    }

    const { error: bodyError } = updateRoleSchema.validate(req.body);
    if (bodyError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: bodyError.details[0].message });
    }

    const { name, description, permissions } = req.body;

    try {
      const permissionList = await checkAndCreatePermissions(permissions);
      const role = await prisma.role.update({
        where: { id: parseInt(req.params.id) },
        data: {
          name,
          description,
          rolesAndPermissions: {
            deleteMany: {},
            create: permissionList.map(p => ({ permissionId: p.id }))
          }
        }
      });

      res.json({ data: role, message: 'Role updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  const addPermissionToRole = async (req, res, next) => {
    const { error: paramsError } = idRoleSchema.validate(req.params);
    if (paramsError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: paramsError.details[0].message });
    }

    const { error: bodyError } = addPermissionSchema.validate(req.body);
    if (bodyError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: bodyError.details[0].message });
    }

    const { permissionId } = req.body;

    try {
      const permission = await prisma.permissions.findUnique({
        where: { id: permissionId }
      });

      if (!permission) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Permission not found' });
      }

      const role = await prisma.role.update({
        where: { id: parseInt(req.params.id) },
        data: {
          rolesAndPermissions: {
            create: { permissionId }
          }
        }
      });

      res.json({ data: role, message: 'Permission added to role successfully' });
    } catch (error) {
      next(error);
    }
  };

  const deleteRole = async (req, res, next) => {
    const { error } = idRoleSchema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
    }

    try {
      await prisma.role.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  const assignAllPermissionsToRole = async (roleId) => {
    try {
      const allPermissions = await prisma.permissions.findMany();
      const permissionIds = allPermissions.map(permission => ({ permissionId: permission.id }));
  
      await prisma.role.update({
        where: { id: roleId },
        data: {
          rolesAndPermissions: {
            create: permissionIds
          }
        }
      });
  
      return true;
    } catch (error) {
      throw error;
    }
  };

  return {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    addPermissionToRole,
    deleteRole,
    assignAllPermissionsToRole
  };
};

export default roleController;




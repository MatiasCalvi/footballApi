import { PrismaClient } from '@prisma/client';
import { levelRules } from '../helpers/levelsRules.js';

const prisma = new PrismaClient();

export const updateUserExperience = async (userId, experienceToAdd) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        experienceGained: { increment: experienceToAdd } 
      }
    });

    let currentLevel = updatedUser.playerLevel;

    for (const level in levelRules) {
      if (updatedUser.experienceGained >= levelRules[level]) {
        await prisma.users.update({
          where: { id: userId },
          data: {
            playerLevel: parseInt(level), 
          }
        });

        updatedUser.playerLevel = parseInt(level);
        currentLevel = parseInt(level); 
      } else {
        break;
      }
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to update user experience and level: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};




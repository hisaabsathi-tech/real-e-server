import { prisma } from "@/lib/prisma";
import {
  createPropertySearchIndex,
  indexProperty,
  removePropertyFromIndex,
  clearSearchCache,
} from "@/lib/redis";
import logger from "@/logger/logger";

export const syncAllPropertiesToRedis = async (): Promise<void> => {
  try {
    logger.info("Starting property sync to Redis...");

    await createPropertySearchIndex();
    
    await clearSearchCache();
    
    const properties = await prisma.property.findMany({
      include: {
        developer: true,
        community: true,
        paymentPlan: true,
        area: true,
        propertyContacts: true,
        user: true,
      },
    });

    logger.info(`Found ${properties.length} properties to sync`);

    const indexPromises = properties.map((property) => indexProperty(property));
    await Promise.all(indexPromises);

    logger.info(`Successfully synced ${properties.length} properties to Redis`);
  } catch (error) {
    logger.error("Failed to sync properties to Redis:", error);
    throw error;
  }
};

export const syncPropertyToRedis = async (
  propertyId: string
): Promise<void> => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        developer: true,
        community: true,
        paymentPlan: true,
        area: true,
        propertyContacts: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (property) {
      await indexProperty(property);
      logger.info(`Property ${propertyId} synced to Redis`);
    } else {
      logger.warn(`Property ${propertyId} not found in database`);
    }
  } catch (error) {
    logger.error(`Failed to sync property ${propertyId} to Redis:`, error);
    throw error;
  }
};

export const removePropertyFromRedis = async (
  propertyId: string
): Promise<void> => {
  try {
    await removePropertyFromIndex(propertyId);
    await clearSearchCache(); // Clear cache when removing items
    logger.info(`Property ${propertyId} removed from Redis index`);
  } catch (error) {
    logger.error(`Failed to remove property ${propertyId} from Redis:`, error);
    throw error;
  }
};

export const updatePropertyInRedis = async (
  propertyId: string
): Promise<void> => {
  try {
    await syncPropertyToRedis(propertyId);
    await clearSearchCache();
  } catch (error) {
    logger.error(`Failed to update property ${propertyId} in Redis:`, error);
    throw error;
  }
};

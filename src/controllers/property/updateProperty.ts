import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import { updatePropertyInRedis, removePropertyFromRedis } from "@/lib/propertySearchSync";
import logger from "@/logger/logger";
import { updatePropertySchema } from "@/schemas";
import { Request, Response } from "express";

export const updateProperty = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { id } = req.params;
    const body = req.body;

    const existingProperty = await prisma.property.findUnique({ 
      where: { 
        id,
        ...(req.user.role === "AGENT" && { userId: req.user.id }),
      } 
    });
    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    const validatedData = validator({ schema: updatePropertySchema, body });
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Validate foreign key references if they are being updated
    const validationPromises = [];
    if (validatedData.developerId) {
      validationPromises.push(prisma.developer.findUnique({ where: { id: validatedData.developerId } }));
    }
    if (validatedData.communityId) {
      validationPromises.push(prisma.community.findUnique({ where: { id: validatedData.communityId } }));
    }
    if (validatedData.paymentPlanId) {
      validationPromises.push(prisma.paymentPlan.findUnique({ where: { id: validatedData.paymentPlanId } }));
    }
    if (validatedData.areaId) {
      validationPromises.push(prisma.area.findUnique({ where: { id: validatedData.areaId } }));
    }

    if (validationPromises.length > 0) {
      const results = await Promise.all(validationPromises);
      if (results.some(result => !result)) {
        return res.status(404).json({ error: "One or more referenced entities not found" });
      }
    }

    const { handover, ...otherData } = validatedData;
    const updateData: any = { ...otherData };
    
    if (handover) {
      updateData.handover = new Date(handover);
    }
    
    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        developer: true,
        community: true,
        paymentPlan: true,
        area: true,
      },
    });

    updatePropertyInRedis(property.id).catch(error => {
      logger.error(`Failed to update property ${property.id} in Redis:`, error);
    });

    return res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    logger.error("Error in updateProperty controller:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { id } = req.params;
    const existingProperty = await prisma.property.findUnique({ 
      where: { 
        id,
        ...(req.user.role === "AGENT" && { userId: req.user.id }),
      } 
    });

    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    await prisma.property.delete({ where: { id } });

    // Remove from Redis search index (async, don't wait for it)
    removePropertyFromRedis(id).catch(error => {
      logger.error(`Failed to remove property ${id} from Redis:`, error);
    });

    return res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteProperty controller:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
};

import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import {
  addPropertyContactSchema,
  updatePropertyContactSchema,
} from "@/schemas";
import { Request, Response } from "express";
import { paginate } from "@/lib/paginate";

export const addPropertyContact = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validatedData = validator({ schema: addPropertyContactSchema, body });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const { propertyId, name, phone, email, message } = validatedData;
    const propertyContact = await prisma.propertyContact.create({
      data: {
        userId: req.user?.id,
        propertyId,
        name,
        phone,
        email,
        message,
      },
      include: {
        property: true,
      },
    });

    return res.status(201).json({
      message: "Property contact added successfully",
      data: propertyContact,
    });
  } catch (error) {
    logger.error("Error in addPropertyContact controller:", error);
    res.status(500).json({ error: "Failed to add property contact" });
  }
};

export const getPropertyContacts = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { propertyId } = req.query;

    const where: any = {};
    if (propertyId) where.propertyId = propertyId;

    if (req.user.role === "USER") {
      where.userId = req.user.id;
    }

    if (req.user.role === "AGENT") {
      where.property = {
        userId: req.user.id,
      };
    }

    const propertyContacts = await prisma.propertyContact.findMany({
      where,
      include: {
        property: {
          include: {
            user: true,
            area: true,
            developer: true,
            community: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const { page, limit, totalPages, totalItems, items } = paginate(
      propertyContacts,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getPropertyContacts controller:", error);
    res.status(500).json({ error: "Failed to get property contacts" });
  }
};

export const getPropertyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const propertyContact = await prisma.propertyContact.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            user: true,
            area: true,
            developer: true,
            community: true,
          },
        },
      },
    });

    if (!propertyContact) {
      return res.status(404).json({ error: "Property contact not found" });
    }

    return res.status(200).json({ data: propertyContact });
  } catch (error) {
    logger.error("Error in getPropertyContact controller:", error);
    res.status(500).json({ error: "Failed to get property contact" });
  }
};

export const updatePropertyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingPropertyContact = await prisma.propertyContact.findUnique({
      where: { id },
    });
    if (!existingPropertyContact) {
      return res.status(404).json({ error: "Property contact not found" });
    }

    const validatedData = validator({
      schema: updatePropertyContactSchema,
      body,
    });
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const propertyContact = await prisma.propertyContact.update({
      where: { id },
      data: validatedData,
      include: {
        property: {
          include: {
            user: true,
            area: true,
            developer: true,
            community: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Property contact updated successfully",
      data: propertyContact,
    });
  } catch (error) {
    logger.error("Error in updatePropertyContact controller:", error);
    res.status(500).json({ error: "Failed to update property contact" });
  }
};

export const deletePropertyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingPropertyContact = await prisma.propertyContact.findUnique({
      where: { id },
    });

    if (!existingPropertyContact) {
      return res.status(404).json({ error: "Property contact not found" });
    }

    await prisma.propertyContact.delete({ where: { id } });

    return res.status(200).json({
      message: "Property contact deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deletePropertyContact controller:", error);
    res.status(500).json({ error: "Failed to delete property contact" });
  }
};

import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { addContactSchema, updateContactSchema } from "@/schemas";
import { Request, Response } from "express";
import { paginate } from "@/lib/paginate";

export const addContact = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validatedData = validator({ schema: addContactSchema, body });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }
    const contact = await prisma.contact.create({
      data: validatedData,
    });

    return res.status(201).json({
      message: "Contact added successfully",
      contact,
    });
  } catch (error) {
    logger.error("Error in addContact controller:", error);
    res.status(500).json({ error: "Failed to add contact" });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });

    const { page, limit, totalPages, totalItems, items } = paginate(
      contacts,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getContacts controller:", error);
    res.status(500).json({ error: "Failed to get contacts" });
  }
};

export const getContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({ where: { id } });

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.status(200).json({ contact });
  } catch (error) {
    logger.error("Error in getContact controller:", error);
    res.status(500).json({ error: "Failed to get contact" });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingContact = await prisma.contact.findUnique({ where: { id } });
    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const validatedData = validator({ schema: updateContactSchema, body });
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      message: "Contact updated successfully",
      contact,
    });
  } catch (error) {
    logger.error("Error in updateContact controller:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingContact = await prisma.contact.findUnique({ where: { id } });

    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    await prisma.contact.delete({ where: { id } });

    return res.status(200).json({
      message: "Contact deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteContact controller:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

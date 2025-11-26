import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { addAreaSchema } from "@/schemas";
import { Request, Response } from "express";

export const addArea = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validatedData = validator({
      schema: addAreaSchema,
      body,
    });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const area = await prisma.area.create({
      data: validatedData,
    });

    return res.status(201).json({
      message: "Area added successfully",
      data: area,
    });
  } catch (error) {
    logger.error("Error in addArea controller:", error);
    res.status(500).json({ error: "Failed to add area" });
  }
};

import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { updateAreaSchema } from "@/schemas";
import { Request, Response } from "express";

export const updateArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingArea = await prisma.area.findUnique({
      where: { id },
    });

    if (!existingArea) {
      return res.status(404).json({ error: "Area not found" });
    }

    const validatedData = validator({
      schema: updateAreaSchema,
      body,
    });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }
    
    const area = await prisma.area.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      message: "Area updated successfully",
      data: area,
    });
  } catch (error) {
    logger.error("Error in updateArea controller:", error);
    res.status(500).json({ error: "Failed to update area" });
  }
};

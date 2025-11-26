import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { updateDeveloperSchema } from "@/schemas";
import { Request, Response } from "express";

export const updateDeveloper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingDeveloper = await prisma.developer.findUnique({
      where: { id },
    });

    if (!existingDeveloper) {
      return res.status(404).json({ error: "Developer not found" });
    }

    const validatedData = validator({
      schema: updateDeveloperSchema,
      body,
    });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }
    
    const developer = await prisma.developer.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      message: "Developer updated successfully",
      data: developer,
    });
  } catch (error) {
    logger.error("Error in addDeveloper controller:", error);
    res.status(500).json({ error: "Failed to add developer" });
  }
};

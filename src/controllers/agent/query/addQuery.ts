import { Request, Response } from "express";
import { validator } from "@/lib/validator";
import { addQuerySchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";

export const addQuery = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validatedData = await validator({
      schema: addQuerySchema,
      body,
    });
    
    if (!validatedData) {
      return res.status(500).json({ message: "Validation error" });
    }

    const existingQuery = await prisma.agentQuery.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (existingQuery) {
      return res.status(400).json({
        message: "Query with this email already exists",
      });
    }

    const query = await prisma.agentQuery.create({
      data: validatedData,
    });

    if (!query) {
      return res.status(500).json({
        message: "Failed to add query",
      });
    }

    res.status(200).json({
      message: "Successfully added query",
      data: query,
    });
  } catch (error) {
    logger.error("Error in addQuery controller:", error);
    res.status(500).json({ error: "Failed to add query" });
  }
};

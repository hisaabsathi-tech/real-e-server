import { Area, Developer } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { addCommunitySchema } from "@/schemas";
import { Request, Response } from "express";

export const addCommunity = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validatedData = validator({
      schema: addCommunitySchema,
      body,
    });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { name, description, areaId, developerId } = validatedData;

    const areaPromises = areaId.map(async (element: any) => {
      const foundArea = await prisma.area.findUnique({
        where: { id: element },
      });
      return foundArea;
    });

    const areaResults = await Promise.all(areaPromises);
    const area: Area[] = areaResults.filter(
      (foundArea): foundArea is Area => foundArea !== null
    );

    const developerPromises = developerId.map(async (element: any) => {
      const foundDeveloper = await prisma.developer.findUnique({
        where: { id: element },
      });
      return foundDeveloper;
    });

    const developerResults = await Promise.all(developerPromises);
    const developer: Developer[] = developerResults.filter(
      (foundDeveloper): foundDeveloper is Developer => foundDeveloper !== null
    );

    const community = await prisma.community.create({
      data: {
        name,
        description,
        area: {
          connect: area.map((a) => ({ id: a.id })),
        },
        developer: {
          connect: developer.map((d) => ({ id: d.id })),
        },
      },
      include: {
        area: true,
        developer: true,
      },
    });

    return res.status(201).json({
      message: "Community added successfully",
      community,
    });
  } catch (error) {
    logger.error("Error in addCommunity controller:", error);
    res.status(500).json({ error: "Failed to add community" });
  }
};

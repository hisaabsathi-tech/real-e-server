import { Area, Developer } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { updateCommunitySchema } from "@/schemas";
import { Request, Response } from "express";

export const updateCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingCommunity = await prisma.community.findUnique({
      where: { id },
      include: {
        area: true,
        developer: true,
      },
    });

    if (!existingCommunity) {
      return res.status(404).json({ error: "Community not found" });
    }

    await prisma.community.update({
      where: { id },
      data: {
        area: body.areaId &&
          body.areaId.length > 0 && {
            set: [],
          },
        developer: body.developerId &&
          body.developerId.length > 0 && {
            set: [],
          },
      },
      include: {
        area: true,
        developer: true,
      },
    });

    const validatedData = validator({
      schema: updateCommunitySchema,
      body,
    });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { areaId, developerId } = validatedData;

    const updateData: Record<string, unknown> = {};
    for (const key in body) {
      if (
        Object.prototype.hasOwnProperty.call(body, key) &&
        key in existingCommunity &&
        key !== "areaId" &&
        key !== "developerId"
      ) {
        const communityKey = key as keyof typeof existingCommunity;
        if (body[communityKey] !== existingCommunity[communityKey]) {
          updateData[communityKey] = body[communityKey];
        }
      }
    }

    // Handle area relation
    if (body.areaId && body.areaId.length > 0) {
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

      updateData.area = {
        connect: area.map((a) => ({ id: a.id })),
      };
    }

    // Handle developer relation
    if (body.developerId && body.developerId.length > 0) {
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

      updateData.developer = {
        connect: developer.map((d) => ({ id: d.id })),
      };
    }
    
    const community = await prisma.community.update({
      where: { id },
      data: updateData,
      include: {
        area: true,
        developer: true,
      },
    });

    return res.status(200).json({
      message: "Community updated successfully",
      community,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error in updateCommunity controller:", error);
    res.status(500).json({ error: "Failed to update community" });
  }
};

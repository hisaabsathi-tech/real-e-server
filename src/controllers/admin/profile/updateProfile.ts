import { Area } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const body = req.body;

    let area: Area[] = [];

    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
      include: { area: true },
    });

    if (!adminUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (body.area && Array.isArray(body.area)) {
      const areaPromises = body.area.map(async (element: any) => {
        const foundArea = await prisma.area.findUnique({
          where: { id: element },
        });
        return foundArea;
      });

      const areaResults = await Promise.all(areaPromises);
      area = areaResults.filter(
        (foundArea): foundArea is Area => foundArea !== null
      );
    }

    const updateData: any = { ...body };
    
    if (body.area && Array.isArray(body.area)) {
      updateData.area = {
        disconnect: adminUser.area ? adminUser.area.map((a) => ({ id: a.id })) : [],
        connect: area.map((a) => ({ id: a.id })),
      };
    }
    
    const user = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      include: {
        area: true,
        Selling: true,
      }
    });

    res.status(200).json({ data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

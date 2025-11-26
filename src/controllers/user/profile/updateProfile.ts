import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const body = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...body },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

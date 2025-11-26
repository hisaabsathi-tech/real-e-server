import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

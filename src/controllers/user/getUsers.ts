import { paginate } from "@/lib/paginate";
import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const data = await prisma.user.findMany();

    const users = data.filter((user) => user.role === "USER");

    const paginatedUsers = paginate(
      users,
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({ ...paginatedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

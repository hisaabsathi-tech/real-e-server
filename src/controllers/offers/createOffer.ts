import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";
import { Request, Response } from "express";
import logger from "@/logger/logger";

export const createOffer = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const offer = await prisma.makeOffer.create({
      data: { ...body, userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    if (!offer) {
      return ReturnResponse.error(res, {
        message: "Cannot create offer",
        statusCode: 400,
      });
    }

    ReturnResponse.success(res, {
      message: "Offer created successfully",
      data: offer,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error creating offers", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

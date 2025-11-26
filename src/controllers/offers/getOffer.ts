import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";
import { Request, Response } from "express";
import logger from "@/logger/logger";

export const getOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ReturnResponse.error(res, {
        message: "Offer ID is required",
        statusCode: 400,
      });
    }

    const offer = await prisma.makeOffer.findUnique({
      where: { id },
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
      return ReturnResponse.success(res, {
        message: "No offer found",
        data: [],
        statusCode: 200,
      });
    }

    ReturnResponse.success(res, {
      message: "Offers fetched successfully",
      data: offer,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error fetching offers", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

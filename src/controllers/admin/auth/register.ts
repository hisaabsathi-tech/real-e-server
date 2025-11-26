import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";
import { validator } from "@/lib/validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema } from "@/schemas";
import { sendResetMail } from "@/mails/sendResetMail";
import { generateOtp } from "@/lib/generateOtp";
import { Area } from "@/generated/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validatedData = validator({
      schema: registerSchema,
      body,
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword =
      validatedData.password && (await bcrypt.hash(validatedData.password, 10));

    const areaPromises = validatedData.area.map(async (element: any) => {
      const foundArea = await prisma.area.findUnique({
        where: { id: element },
      });
      return foundArea;
    });
    
    const areaResults = await Promise.all(areaPromises);
    const area: Area[] = areaResults.filter(
      (foundArea): foundArea is Area => foundArea !== null
    );

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword && hashedPassword,
        role: validatedData.role,
        otp: generateOtp(),
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        area: area && {
          connect: area.map((a) => ({ id: a.id })),
        },
      },
    });

    if (validatedData.role === "AGENT") {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, otp: user.otp },
        process.env.JWT_SECRET as string,
        { expiresIn: "5M" }
      );

      await sendResetMail(user.email, token);
    }

    return res.status(200).json({
      message: "Registration successful",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Validation failed")
    ) {
      logger.error("Validation error:", error.message);
      return res.status(400).json({
        message: "Invalid request data",
        details: error.message,
      });
    }

    logger.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";
import { validator } from "@/lib/validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/schemas";

export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validatedData = validator({
      schema: loginSchema,
      body,
    });

    const admin = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      admin.password!
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );
    
    return res.status(200).json({
      message: "Login successful",
      token: token,
      data: {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isVerified: admin.isVerified,
        },
      },
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

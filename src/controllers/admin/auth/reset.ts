import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const reset = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { password } = req.body;
    const { otp } = req.user;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp) {
      return res.status(400).json({ message: "OTP is not set" });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (otp !== user.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.user.update({
      where: { email: req.user.email },
      data: { isVerified: true, otp: null, otpExpires: null },
    });

    const hashedPassword = password && (await bcrypt.hash(password, 10));

    await prisma.user.update({
      where: { email: req.user.email },
      data: {
        password: hashedPassword && hashedPassword,
      },
    });

    return res.status(200).json({
      message: "Password reset successful",
      success: true,
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

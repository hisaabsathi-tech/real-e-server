import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import bcrypt from "bcrypt";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, password, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP is not set" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (otp !== user.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = password && (await bcrypt.hash(password, 10));

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isVerified: true,
        otp: null,
        otpExpires: null,
      },
    });

    return res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (error) {
    logger.error("Error in forgotPassword:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

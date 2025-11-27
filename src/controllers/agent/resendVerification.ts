import { generateOtp } from "@/lib/generateOtp";
import { prisma } from "@/lib/prisma";
import { sendResetMail } from "@/mails/sendResetMail";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { id, email, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        otp: generateOtp(),
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, otp: user.otp },
      process.env.JWT_SECRET as string,
      { expiresIn: "5M" }
    );

    role === "AGENT" && (await sendResetMail(email, token));

    return res.status(200).json({
      message: "Reset mail sent successfully",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

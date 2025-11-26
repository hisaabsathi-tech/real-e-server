import { sendOtp } from "@/mails/sendOtp";
import { Request, Response } from "express";

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await sendOtp(email, "user");

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

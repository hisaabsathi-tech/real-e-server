import { config } from "@/config/config";
import { sendAddPropertyMail } from "@/mails/sendAddPropertyMail";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const givePermitToAddProperty = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email } = req.body;

    const token = jwt.sign(
      {
        id: Math.random().toString(36).substring(2, 15),
        email: email,
        role: "USER",
        permittedToAddProperty: true,
        isDraft: true,
        agentId: req.user.id,
      },
      config.jwtsecret,
      {
        expiresIn: "1d",
      }
    );

    const link = `${config.clienturl}/property?token=${token}`;

    await sendAddPropertyMail(email, link);

    return res.status(200).json({
      message: "Property adding email sent successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

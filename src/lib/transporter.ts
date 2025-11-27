import { config } from "@/config/config";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL || config.email,
    pass: process.env.PASSWORD || config.password,
  },
});

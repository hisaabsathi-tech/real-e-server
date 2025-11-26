import { sendEmail } from "@/lib/sendEmail";
import { resetPasswordTemplate } from "@/templates/resetPassword";
import { verifyOtpTemplate } from "@/templates/verifyOtp";

export const sendResetMail = async (to: string, token: string) => {
  const subject = "Password Reset Request";
  const link = `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;
  
  const html = resetPasswordTemplate(link);

  await sendEmail(to, subject, html);
};

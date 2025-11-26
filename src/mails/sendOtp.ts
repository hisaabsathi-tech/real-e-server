import { generateOtp } from "@/lib/generateOtp";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendEmail";
import { verifyOtpTemplate } from "@/templates/verifyOtp";

export const sendOtp = async (to: string, type?: string) => {
  const otp = generateOtp();
  const subject = "Your OTP Code";
  const expiresIn = new Date(Date.now() + 10 * 60 * 1000);

  const html = verifyOtpTemplate(otp);
  await prisma.user.update({
    where: { email: to },
    data: {
      otp,
      otpExpires: expiresIn,
    },
  });

  await sendEmail(to, subject, html);
};

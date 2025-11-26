import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import bcrypt from "bcrypt";

export const defaultAdmin = async () => {
  try {
    const name = process.env.DEFAULT_NAME!;
    const email = process.env.DEFAULT_EMAIL!;
    const password = process.env.DEFAULT_PASSWORD!;

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return logger.warn("Admin exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    logger.info("Admin created");
    return;
  } catch (error) {
    logger.error("Default admin creation error:", error);
  }
};

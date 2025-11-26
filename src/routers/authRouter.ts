import { Router } from "express";
import { login } from "@/controllers/admin/auth/login";
import { register } from "@/controllers/admin/auth/register";
import { userLogin } from "@/controllers/user/auth/login";
import { userRegister } from "@/controllers/user/auth/register";
import { updateRole } from "@/controllers/admin/role/updateRole";
import { verify as userVerify } from "@/controllers/user/verify/verify";
import { reset as adminPassReset } from "@/controllers/admin/auth/reset";
import { verifyToken } from "@/middlewares/token";
import { resendOtp } from "@/controllers/user/auth/resendOtp";
import { googleAuth } from "@/controllers/user/auth/google/google";
import { googleCallback } from "@/controllers/user/auth/google/googleCallback";
import { forgotPassword } from "@/controllers/user/auth/forgot-password";

const router = Router();

// Admin authentication routes
router.post("/login", login);
router.post("/register", register);

// Admin password reset route
router.post("/reset", verifyToken, adminPassReset);

// User authentication routes
router.post("/user/login", userLogin);
router.post("/user/register", userRegister);

// Admin password reset route
router.post("/user/resend", resendOtp);

// User verification route
router.post("/user/verify", verifyToken, userVerify);

// Update admin-user role
router.patch("/verify/:userId", verifyToken, updateRole);

// Forget password routes
router.post("/forgot-password", forgotPassword);

// Google OAuth 2 - with session logging for debugging
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export { router as authRouter };

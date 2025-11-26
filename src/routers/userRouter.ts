import { deleteUser } from "@/controllers/user/deleteUser";
import { getUsers } from "@/controllers/user/getUsers";
import { isValidToken } from "@/controllers/user/isValidToken";
import { createCalendarEvent } from "@/controllers/user/meet/createCalenderEvent";
import { profile } from "@/controllers/user/profile/profile";
import { updateProfile } from "@/controllers/user/profile/updateProfile";
import { sessionMiddleware } from "@/middlewares/sessionMiddleware";
import { Router } from "express";

const router = Router();

router.get("/", getUsers);
router.get("/profile", profile);
router.patch("/profile", updateProfile);
router.delete("/:id", deleteUser);

// Google Calendar routes - require Google authentication
router.post("/meet/create", sessionMiddleware, createCalendarEvent);

// Is valid token
router.get("/isValidToken", isValidToken);

export { router as userRouter };

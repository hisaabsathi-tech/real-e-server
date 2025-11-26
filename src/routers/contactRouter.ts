import {
  addContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} from "@/controllers/contact/contactControllers";
import { verifyToken } from "@/middlewares/token";
import { Router } from "express";

const router = Router();

router.get("/", verifyToken, getContacts);
router.get("/:id", verifyToken, getContact);
router.post("/", addContact);
router.patch("/:id", verifyToken, updateContact);
router.delete("/:id", verifyToken, deleteContact);

export { router as contactRouter };

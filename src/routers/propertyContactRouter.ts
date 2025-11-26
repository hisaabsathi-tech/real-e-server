import { 
  addPropertyContact, 
  getPropertyContacts, 
  getPropertyContact, 
  updatePropertyContact, 
  deletePropertyContact 
} from "@/controllers/propertyContact/propertyContactControllers";
import { Router } from "express";

const router = Router();

router.get("/", getPropertyContacts);
router.get("/:id", getPropertyContact);
router.post("/", addPropertyContact);
router.patch("/:id", updatePropertyContact);
router.delete("/:id", deletePropertyContact);

export { router as propertyContactRouter };

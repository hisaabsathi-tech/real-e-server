import { addProperty } from "@/controllers/property/addProperty";
import {
  getProperties,
  getProperty,
} from "@/controllers/property/getProperties";
import {
  updateProperty,
  deleteProperty,
} from "@/controllers/property/updateProperty";
import {
  searchPropertiesRedis,
  autocompletePropertiesEndpoint,
  getPropertySearchStats,
  syncPropertyEndpoint,
  syncAllProperty,
} from "@/controllers/property/searchProperties";
import { Router } from "express";
import { verifyToken } from "@/middlewares/token";

const router = Router();

// Regular CRUD operations
router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", verifyToken, addProperty);
router.patch("/:id", verifyToken, updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

// Fast search operations
router.get("/search/fast", searchPropertiesRedis);
router.get("/search/autocomplete", autocompletePropertiesEndpoint);
router.get("/search/stats", getPropertySearchStats);
router.get("/search/sync/all", syncAllProperty);
router.post("/search/sync/:propertyId", syncPropertyEndpoint);

export { router as propertyRouter };

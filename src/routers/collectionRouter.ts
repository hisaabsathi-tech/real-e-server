import { addCollection } from "@/controllers/collection/addCollection";
import { getCollections, getCollection } from "@/controllers/collection/getCollections";
import { deleteCollection } from "@/controllers/collection/deleteCollection";
import { Router } from "express";

const router = Router();

router.get("/", getCollections);
router.get("/:id", getCollection);
router.post("/", addCollection);
router.delete("/:id", deleteCollection);

export { router as collectionRouter };

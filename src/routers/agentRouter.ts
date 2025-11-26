import { Router } from "express";
import { addQuery } from "@/controllers/agent/query/addQuery";
import { getQueries } from "@/controllers/agent/query/getQueries";
import { verifyToken } from "@/middlewares/token";
import { getAgents } from "@/controllers/agent/getAgents";
import { getQueryById } from "@/controllers/agent/query/getQueryById";
import { deleteQuery } from "@/controllers/agent/query/deleteQuery";
import { deleteAgent } from "@/controllers/agent/deleteAgent";
import { updateAgent } from "@/controllers/agent/updateAgent";
import { resendVerification } from "@/controllers/agent/resendVerification";
import { getAgentByArea } from "@/controllers/agent/area/getAgentByArea";
import { givePermitToAddProperty } from "@/controllers/agent/property/givePermitToAddProperty";
import { getAgentById } from "@/controllers/agent/getAgentById";

const router = Router();

// Route to Agents
router.get("/", verifyToken, getAgents);
router.get("/:id", verifyToken, getAgentById);
router.patch("/", verifyToken, updateAgent);
router.delete("/:id", verifyToken, deleteAgent);

// Route for resending verification
router.post("/resend-verification", resendVerification);

// Route to Queries
router.get("/query", verifyToken, getQueries);
router.get("/query/:id", verifyToken, getQueryById);
router.post("/query", addQuery);
router.delete("/query/:id", deleteQuery);

router.get("/areas", verifyToken, getAgentByArea);

// Give permit to add property
router.post("/property/permit", verifyToken, givePermitToAddProperty);

export { router as agentRouter };

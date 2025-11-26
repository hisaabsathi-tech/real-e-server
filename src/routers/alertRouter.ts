import { Router } from "express";
import { createAlert } from "@/controllers/alert/createAlert";
import { getAlerts } from "@/controllers/alert/getAlerts";
import { updateAlert } from "@/controllers/alert/updateAlert";
import { deleteAlert } from "@/controllers/alert/deleteAlert";
import { unsubscribeAlert } from "@/controllers/alert/unsubscribeAlert";

const alertRouter = Router();

// Public routes
alertRouter.post("/", createAlert);
alertRouter.get("/", getAlerts);
alertRouter.get("/unsubscribe", unsubscribeAlert);

// Protected routes (user can be authenticated or not, but they need to own the alert)
alertRouter.put("/:id", updateAlert);
alertRouter.delete("/:id", deleteAlert);

export { alertRouter };

import { Request, Response, Router } from "express";
import { verifyToken } from "@/middlewares/token";
import logger from "@/logger/logger";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { developerRouter } from "./developerRouter";
import { areaRouter } from "./areaRouter";
import { communityRouter } from "./communityRouter";
import { paymentPlanRouter } from "./paymentPlanRouter";
import { propertyRouter } from "./propertyRouter";
import { propertyContactRouter } from "./propertyContactRouter";
import { contactRouter } from "./contactRouter";
import { collectionRouter } from "./collectionRouter";
import { requestTourRouter } from "./requestTourRouter";
import { fileRouter } from "./fileRouter";
import { agentRouter } from "./agentRouter";
import { userRouter } from "./userRouter";
import { adminRouter } from "./adminRouter";
import { sellingRouter } from "./sellingRouter";
import { dashboardRouter } from "./dashboardRouter";
import { alertRouter } from "./alertRouter";
import { offerRouter } from "./offerRouter";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

router.get("/logs", (req: Request, res: Response) => {
  try {
    const logFilePath = join(process.cwd(), "logs", "combined.log");

    if (!existsSync(logFilePath)) {
      res.status(404).send("Log file not found");
      return;
    }

    const logContent = readFileSync(logFilePath, "utf8");
    res.setHeader("Content-Type", "text/plain");
    res.send(logContent);
  } catch (error) {
    logger.error(`Error reading log file: ${error}`);
    res.status(500).send("Error reading log file");
  }
});

// Protected routes
router.use("/users", verifyToken, userRouter);
router.use("/developers", verifyToken, developerRouter);
router.use("/areas", areaRouter);
router.use("/communities", communityRouter);
router.use("/payment-plans", verifyToken, paymentPlanRouter);
router.use("/properties", propertyRouter);
router.use("/property-contacts", verifyToken, propertyContactRouter);
router.use("/offers", verifyToken, offerRouter);
router.use("/contacts", contactRouter);
router.use("/sellings", sellingRouter);
router.use("/collections", verifyToken, collectionRouter);
router.use("/request-tours", verifyToken, requestTourRouter);
router.use("/agent", agentRouter);
router.use("/admin", verifyToken, adminRouter);
router.use("/dashboard", verifyToken, dashboardRouter);
router.use("/file", verifyToken, fileRouter);
router.use("/alerts", verifyToken, alertRouter);

export { router as indexRouter };

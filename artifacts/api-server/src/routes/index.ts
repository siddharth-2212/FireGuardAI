import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sensorsRouter from "./sensors";
import alertsRouter from "./alerts";
import detectionRouter from "./detection";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sensorsRouter);
router.use(alertsRouter);
router.use(detectionRouter);
router.use(dashboardRouter);

export default router;

import { Router } from "express";
import { analyzeMonthlySummaryHandler, analyzeStockHandler, analyzeDebtsHandler } from "../controllers/ai.controller";
import authenticate from "../middleware/authenticate";
import catchErrors from "../utils/catchErrors";

const aiRouter = Router();

aiRouter.get("/summary", authenticate, catchErrors(analyzeMonthlySummaryHandler));
aiRouter.get("/stock", authenticate, catchErrors(analyzeStockHandler));
aiRouter.get("/debt", authenticate, catchErrors(analyzeDebtsHandler));

export default aiRouter;
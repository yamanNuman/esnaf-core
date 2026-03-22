import { Router } from "express";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import catchErrors from "../utils/catchErrors";
import { createSaleHandler, getSalesHandler, getSaleHandler, deleteSaleHandler, getSalesReportHandler } from "../controllers/sale.controller";

const saleRouter = Router();

saleRouter.get("/", authenticate, catchErrors(getSalesHandler));
saleRouter.get('/report', authenticate, catchErrors(getSalesReportHandler));
saleRouter.get("/:id", authenticate, catchErrors(getSaleHandler));
saleRouter.post("/", authenticate, authorize("ADMIN"), catchErrors(createSaleHandler));
saleRouter.delete("/:id", authenticate, authorize("ADMIN"), catchErrors(deleteSaleHandler));

export default saleRouter;
import { Router } from "express";
import catchErrors from "../utils/catchErrors";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import { generateTaxCalendarHandler, getTaxesHandler, updateTaxHandler } from "../controllers/tax.controller";

const taxRouter = Router();

taxRouter.get('/', catchErrors(authenticate), authorize("ADMIN","USER"), catchErrors(getTaxesHandler));
taxRouter.post('/generate/:year', catchErrors(authenticate), authorize("ADMIN"), catchErrors(generateTaxCalendarHandler));
taxRouter.put('/:id', catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateTaxHandler));

export default taxRouter;
import { Router } from "express";
import { getDebtsHandler, getDebtHandler, createDebtHandler,getDebtNamesHandler, createTransactionHandler, updateDebtHandler, deleteDebtHandler, getRecentTransactionsHandler, deleteTransactionHandler } from "../controllers/debt.controller";
import catchErrors from "../utils/catchErrors";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";

const debtRouter = Router();

debtRouter.get('/names', catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getDebtNamesHandler));
debtRouter.get("/recent-transactions", authenticate, catchErrors(getRecentTransactionsHandler));
debtRouter.get("/", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getDebtsHandler));
debtRouter.get("/:id", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getDebtHandler));
debtRouter.post("/", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createDebtHandler));
debtRouter.post("/:id/transaction", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createTransactionHandler));
debtRouter.put("/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateDebtHandler));
debtRouter.delete("/transaction/:id", authenticate, authorize("ADMIN"), catchErrors(deleteTransactionHandler));
debtRouter.delete("/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteDebtHandler));

export default debtRouter;
import { Router } from "express";
import {
    getDailyEntriesHandler, upsertDailyEntryHandler, deleteDailyEntryHandler,
    getExpensesHandler, createExpenseHandler, updateExpenseHandler, deleteExpenseHandler,
    getFixedExpenseTemplatesHandler, createFixedExpenseTemplateHandler, updateFixedExpenseTemplateHandler, deleteFixedExpenseTemplateHandler,
    getAdditionalIncomeTemplatesHandler, createAdditionalIncomeTemplateHandler, updateAdditionalIncomeTemplateHandler, deleteAdditionalIncomeTemplateHandler,
    generateMonthHandler,
    getMonthlyFixedExpensesHandler, createMonthlyFixedExpenseHandler, updateMonthlyFixedExpenseHandler, deleteMonthlyFixedExpenseHandler,
    getMonthlyAdditionalIncomesHandler, updateMonthlyAdditionalIncomeHandler,
    upsertMonthlyCarryoverHandler,
    getMonthlySummaryHandler,
    getSetAsideTransactionsHandler,
    createSetAsideTransactionHandler,
    deleteSetAsideTransactionHandler
} from "../controllers/accounting.controller";
import catchErrors from "../utils/catchErrors";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import { checkMonthExistsHandler } from "../controllers/accounting.controller";

const accountingRouter = Router();

// Daily Entry
accountingRouter.get("/daily", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getDailyEntriesHandler));
accountingRouter.post("/daily", catchErrors(authenticate), authorize("ADMIN"), catchErrors(upsertDailyEntryHandler));
accountingRouter.delete("/daily/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteDailyEntryHandler));

// Expense
accountingRouter.get("/expenses", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getExpensesHandler));
accountingRouter.post("/expenses", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createExpenseHandler));
accountingRouter.put("/expenses/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateExpenseHandler));
accountingRouter.delete("/expenses/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteExpenseHandler));

// Fixed Expense Templates
accountingRouter.get("/templates/fixed", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getFixedExpenseTemplatesHandler));
accountingRouter.post("/templates/fixed", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createFixedExpenseTemplateHandler));
accountingRouter.put("/templates/fixed/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateFixedExpenseTemplateHandler));
accountingRouter.delete("/templates/fixed/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteFixedExpenseTemplateHandler));

// Additional Income Templates
accountingRouter.get("/templates/income", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getAdditionalIncomeTemplatesHandler));
accountingRouter.post("/templates/income", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createAdditionalIncomeTemplateHandler));
accountingRouter.put("/templates/income/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateAdditionalIncomeTemplateHandler));
accountingRouter.delete("/templates/income/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteAdditionalIncomeTemplateHandler));

// Generate Month
accountingRouter.post("/generate", catchErrors(authenticate), authorize("ADMIN"), catchErrors(generateMonthHandler));

// Monthly Fixed Expenses
accountingRouter.get("/monthly/fixed", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getMonthlyFixedExpensesHandler));
accountingRouter.post("/monthly/fixed", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createMonthlyFixedExpenseHandler));
accountingRouter.put("/monthly/fixed/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateMonthlyFixedExpenseHandler));
accountingRouter.delete("/monthly/fixed/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteMonthlyFixedExpenseHandler));

// Monthly Additional Incomes
accountingRouter.get("/monthly/income", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getMonthlyAdditionalIncomesHandler));
accountingRouter.put("/monthly/income/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(updateMonthlyAdditionalIncomeHandler));

// Monthly Carryover
accountingRouter.post("/carryover", catchErrors(authenticate), authorize("ADMIN"), catchErrors(upsertMonthlyCarryoverHandler));

// Monthly Summary
accountingRouter.get("/summary", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getMonthlySummaryHandler));

accountingRouter.get("/check", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(checkMonthExistsHandler));

//SET ASIDE
accountingRouter.get("/set-aside", catchErrors(authenticate), authorize("ADMIN", "USER"), catchErrors(getSetAsideTransactionsHandler));
accountingRouter.post("/set-aside", catchErrors(authenticate), authorize("ADMIN"), catchErrors(createSetAsideTransactionHandler));
accountingRouter.delete("/set-aside/:id", catchErrors(authenticate), authorize("ADMIN"), catchErrors(deleteSetAsideTransactionHandler));
export default accountingRouter;
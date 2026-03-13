import { Request, Response } from "express";
import { OK, CREATED } from "../constants/http";
import {
    dailyEntrySchema, expenseSchema, fixedExpenseTemplateSchema,
    additionalIncomeTemplateSchema, monthlyFixedExpenseSchema,
    monthlyAdditionalIncomeSchema, monthlyCarryoverSchema, generateMonthSchema
} from "../schemas/accounting.schema";
import {
    getDailyEntriesService, upsertDailyEntryService, deleteDailyEntryService,
    getExpenseService, createExpenseService, updateExpenseService, deleteExpenseService,
    getFixedExpenseTemplatesService, createFixedExpenseTemplateService, updateFixedExpenseTemplateService, deleteFixedExpenseTemplateService,
    getAdditionalIncomeTemplatesService, createAdditionalIncomeTemplateService, updateAdditionalIncomeTemplateService, deleteAdditionalIncomeTemplateService,
    generateMonthService,
    getMonthlyFixedExpensesService, createMonthlyFixedExpenseService, updateMonthlyFixedExpenseService, deleteMonthlyFixedExpenseService,
    getMonthlyAdditionalIncomesService, updateMonthlyAdditionalIncomeService,
    upsertMonthlyCarryoverService, getMonthlyCarryoverService,
    getMonthlySummaryService,
    checkMonthExistsService,
    getSetAsideTransactionsService,
    createSetAsideTransactionService,
    deleteSetAsideTransactionService
} from "../services/accounting.service";

const getYearMonth = (req: Request) => ({
    year: parseInt(req.query.year as string) || new Date().getFullYear(),
    month: parseInt(req.query.month as string) || new Date().getMonth() + 1
});

// ─── DAILY ENTRY ─────────────────────────────────────────────────────────────

export const getDailyEntriesHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const entries = await getDailyEntriesService(year, month);
    return res.status(OK).json({ message: "Daily entries fetched successfully", entries });
};

export const upsertDailyEntryHandler = async (req: Request, res: Response) => {
    const data = dailyEntrySchema.parse(req.body);
    const entry = await upsertDailyEntryService(data);
    return res.status(OK).json({ message: "Daily entry saved successfully", entry });
};

export const deleteDailyEntryHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteDailyEntryService(id);
    return res.status(OK).json({ message: "Daily entry deleted successfully" });
};

// ─── EXPENSE ─────────────────────────────────────────────────────────────────

export const getExpensesHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const expenses = await getExpenseService(year, month);
    return res.status(OK).json({ message: "Expenses fetched successfully", expenses });
};

export const createExpenseHandler = async (req: Request, res: Response) => {
    const data = expenseSchema.parse(req.body);
    const expense = await createExpenseService(data);
    return res.status(CREATED).json({ message: "Expense created successfully", expense });
};

export const updateExpenseHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = expenseSchema.partial().parse(req.body);
    const expense = await updateExpenseService(id, data);
    return res.status(OK).json({ message: "Expense updated successfully", expense });
};

export const deleteExpenseHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteExpenseService(id);
    return res.status(OK).json({ message: "Expense deleted successfully" });
};

// ─── FIXED EXPENSE TEMPLATE ──────────────────────────────────────────────────

export const getFixedExpenseTemplatesHandler = async (req: Request, res: Response) => {
    const templates = await getFixedExpenseTemplatesService();
    return res.status(OK).json({ message: "Templates fetched successfully", templates });
};

export const createFixedExpenseTemplateHandler = async (req: Request, res: Response) => {
    const data = fixedExpenseTemplateSchema.parse(req.body);
    const template = await createFixedExpenseTemplateService(data);
    return res.status(CREATED).json({ message: "Template created successfully", template });
};

export const updateFixedExpenseTemplateHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = fixedExpenseTemplateSchema.partial().parse(req.body);
    const template = await updateFixedExpenseTemplateService(id, data);
    return res.status(OK).json({ message: "Template updated successfully", template });
};

export const deleteFixedExpenseTemplateHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteFixedExpenseTemplateService(id);
    return res.status(OK).json({ message: "Template deleted successfully" });
};

// ─── ADDITIONAL INCOME TEMPLATE ──────────────────────────────────────────────

export const getAdditionalIncomeTemplatesHandler = async (req: Request, res: Response) => {
    const templates = await getAdditionalIncomeTemplatesService();
    return res.status(OK).json({ message: "Templates fetched successfully", templates });
};

export const createAdditionalIncomeTemplateHandler = async (req: Request, res: Response) => {
    const data = additionalIncomeTemplateSchema.parse(req.body);
    const template = await createAdditionalIncomeTemplateService(data);
    return res.status(CREATED).json({ message: "Template created successfully", template });
};

export const updateAdditionalIncomeTemplateHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = additionalIncomeTemplateSchema.partial().parse(req.body);
    const template = await updateAdditionalIncomeTemplateService(id, data);
    return res.status(OK).json({ message: "Template updated successfully", template });
};

export const deleteAdditionalIncomeTemplateHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteAdditionalIncomeTemplateService(id);
    return res.status(OK).json({ message: "Template deleted successfully" });
};

// ─── GENERATE MONTH ──────────────────────────────────────────────────────────

export const generateMonthHandler = async (req: Request, res: Response) => {
    const data = generateMonthSchema.parse(req.body);
    const result = await generateMonthService(data.year, data.month);
    return res.status(CREATED).json(result);
};

// ─── MONTHLY FIXED EXPENSE ───────────────────────────────────────────────────

export const getMonthlyFixedExpensesHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const expenses = await getMonthlyFixedExpensesService(year, month);
    return res.status(OK).json({ message: "Monthly fixed expenses fetched successfully", expenses });
};

export const createMonthlyFixedExpenseHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const data = monthlyFixedExpenseSchema.parse(req.body);
    const expense = await createMonthlyFixedExpenseService(year, month, data);
    return res.status(CREATED).json({ message: "Monthly fixed expense created successfully", expense });
};

export const updateMonthlyFixedExpenseHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = monthlyFixedExpenseSchema.partial().parse(req.body);
    const expense = await updateMonthlyFixedExpenseService(id, data);
    return res.status(OK).json({ message: "Monthly fixed expense updated successfully", expense });
};

export const deleteMonthlyFixedExpenseHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteMonthlyFixedExpenseService(id);
    return res.status(OK).json({ message: "Monthly fixed expense deleted successfully" });
};

// ─── MONTHLY ADDITIONAL INCOME ───────────────────────────────────────────────

export const getMonthlyAdditionalIncomesHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const incomes = await getMonthlyAdditionalIncomesService(year, month);
    return res.status(OK).json({ message: "Monthly additional incomes fetched successfully", incomes });
};

export const updateMonthlyAdditionalIncomeHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = monthlyAdditionalIncomeSchema.partial().parse(req.body);
    const income = await updateMonthlyAdditionalIncomeService(id, data);
    return res.status(OK).json({ message: "Monthly additional income updated successfully", income });
};

// ─── MONTHLY CARRYOVER ───────────────────────────────────────────────────────

export const upsertMonthlyCarryoverHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const data = monthlyCarryoverSchema.parse(req.body);
    const carryover = await upsertMonthlyCarryoverService(year, month, data.amount);
    return res.status(OK).json({ message: "Carryover saved successfully", carryover });
};

// ─── MONTHLY SUMMARY ─────────────────────────────────────────────────────────

export const getMonthlySummaryHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const summary = await getMonthlySummaryService(year, month);
    return res.status(OK).json({ message: "Monthly summary fetched successfully", summary });
};

export const checkMonthExistsHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const exists = await checkMonthExistsService(year, month);
    return res.status(OK).json({ exists });
};

//SET ASIDE
export const getSetAsideTransactionsHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const transactions = await getSetAsideTransactionsService(year, month);
    return res.status(OK).json({ message: "Set aside transactions fetched successfully", transactions });
};

export const createSetAsideTransactionHandler = async (req: Request, res: Response) => {
    const { year, month } = getYearMonth(req);
    const { description, amount } = req.body;
    const transaction = await createSetAsideTransactionService(year, month, { description, amount });
    return res.status(CREATED).json({ message: "Set aside transaction created successfully", transaction });
};

export const deleteSetAsideTransactionHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteSetAsideTransactionService(id);
    return res.status(OK).json({ message: "Set aside transaction deleted successfully" });
};
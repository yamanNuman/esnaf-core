import { Request, Response } from "express";
import { OK, CREATED } from "../constants/http";
import { createDebtSchema, createTransactionSchema, updateDebtSchema } from "../schemas/debt.schema";
import { getDebtNamesService, createDebtService, createTransactionService, deleteDebtService, getDebtService, getDebtsService, updateDebtService, getRecentTransactionsService } from "../services/debt.service";


export const getDebtsHandler = async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const debts = await getDebtsService({ search });
    return res.status(OK).json({ message: "Debts fetched successfully", debts });
};

export const getRecentTransactionsHandler = async (req: Request, res: Response) => {
    const transactions = await getRecentTransactionsService(10);
    return res.status(OK).json({ message: "Recent transactions fetched", transactions });
};

export const getDebtHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const debt = await getDebtService(id);
    return res.status(OK).json({ message: "Debt fetched successfully", debt });
};

export const createDebtHandler = async (req: Request, res: Response) => {
    const data = createDebtSchema.parse(req.body);
    const debt = await createDebtService(data);
    return res.status(CREATED).json({ message: "Debt created successfully", debt });
};

export const createTransactionHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string );
    const data = createTransactionSchema.parse(req.body);
    const transaction = await createTransactionService(id, data);
    return res.status(CREATED).json({ message: "Transaction created successfully", transaction });
};

export const updateDebtHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = updateDebtSchema.parse(req.body);
    const debt = await updateDebtService(id, data);
    return res.status(OK).json({ message: "Debt updated successfully", debt });
};

export const deleteDebtHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteDebtService(id);
    return res.status(OK).json({ message: "Debt deleted successfully" });
};

export const getDebtNamesHandler = async (req: Request, res: Response) => {
    const names = await getDebtNamesService();
    return res.status(OK).json({ message: "Debt names fetched successfully", names });
};
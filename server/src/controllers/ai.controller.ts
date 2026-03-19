import { Request, Response } from "express";
import { OK } from "../constants/http";
import { analyzeMonthlySummaryService, analyzeStockService, analyzeDebtsService } from "../services/ai.service";
import { getMonthlySummaryService } from "../services/accounting.service";
import { getProductsService } from "../services/product.service";
import { getDebtsService } from "../services/debt.service";

export const analyzeMonthlySummaryHandler = async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const summary = await getMonthlySummaryService(year, month);
    const analysis = await analyzeMonthlySummaryService({ year, month, ...summary });
    return res.status(OK).json({ message: "Analysis complete", analysis });
};

export const analyzeStockHandler = async (req: Request, res: Response) => {
    const products = await getProductsService({});
    const analysis = await analyzeStockService(products);
    return res.status(OK).json({ message: "Analysis complete", analysis });
};

export const analyzeDebtsHandler = async (req: Request, res: Response) => {
    const debts = await getDebtsService({});
    const mapped = debts.map(d => ({
        name: d.name,
        totalDebt: Number(d.totalDebt),
        dueDate: d.dueDate ? d.dueDate.toISOString() : undefined,
        note: d.note ?? undefined,
    }));
    const analysis = await analyzeDebtsService(mapped);
    return res.status(OK).json({ message: "Analysis complete", analysis });
};
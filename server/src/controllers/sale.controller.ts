import { Request, Response } from "express";
import { OK, CREATED } from "../constants/http";
import { createSaleSchema } from "../schemas/sale.schema";
import { createSaleService, getSalesService, getSaleService, deleteSaleService } from "../services/sale.service";

export const createSaleHandler = async (req: Request, res: Response) => {
    const data = createSaleSchema.parse(req.body);
    const sale = await createSaleService(data);
    return res.status(CREATED).json({ message: "Fiş oluşturuldu", sale });
};

export const getSalesHandler = async (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const result = await getSalesService({ type, page });
    return res.status(OK).json({ message: "Fişler getirildi", ...result });
};

export const getSaleHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params["id"] as string);
    const sale = await getSaleService(id);
    return res.status(OK).json({ message: "Fiş getirildi", sale });
};

export const deleteSaleHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params["id"] as string);
    await deleteSaleService(id);
    return res.status(OK).json({ message: "Fiş silindi" });
};

export const getSalesReportHandler = async (req: Request, res: Response) => {
    const period = (req.query.period as string || "month") as "today" | "week" | "month" | "year" | "custom";
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const report = await getSalesReportService({ period, startDate, endDate });
    return res.status(OK).json({ message: "Report fetched", report });
};
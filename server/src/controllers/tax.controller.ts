import { Request, Response } from "express";
import { OK, CREATED } from "../constants/http";
import { updateTaxSchema } from "../schemas/tax.schema";
import { generateTaxCalendarService, getTaxService, updateTaxService } from "../services/tax.service";

export const generateTaxCalendarHandler = async (req: Request, res: Response) => {
    const year = parseInt(req.params.year as string);
    const count = await generateTaxCalendarService(year);
    return res.status(CREATED).json({
        message: `${year} calendar created.`,
        count
    });
};

export const getTaxesHandler = async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const type = req.query.type as string | undefined;
    const taxes = await getTaxService(year, type);
    return res.status(OK).json({
        message: "Taxes fetched successfully.",
        taxes
    });
};

export const updateTaxHandler = async (req: Request, res: Response) => {
    const id  = parseInt(req.params.id as string);
    const data = updateTaxSchema.parse(req.body);
    const tax = await updateTaxService(id, data);
    return res.status(OK).json({
        message: "Tax updated successfully",
        tax
    });
};
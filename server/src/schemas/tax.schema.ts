import { z } from "zod";

export const updateTaxSchema = z.object({
    amount: z.number().positive().optional(),
    paidAmount: z.number().positive().optional(),
    paidAt: z.iso.datetime().optional().nullable(),
    note: z.string().optional().nullable()
});
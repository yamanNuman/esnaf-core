import { z } from "zod";

export const createDebtSchema = z.object({
    name: z.string().min(1),
    dueDate: z.iso.datetime().optional(),
    note: z.string().optional(),
    initialDebt: z.number().positive().optional()
});

export const createTransactionSchema = z.object({
    type: z.enum(["PURCHASE","PAYMENT"]),
    amount: z.number().positive(),
    note: z.string().optional(),
    date: z.iso.datetime().optional()
});

export const updateDebtSchema = z.object({
    name: z.string().min(1).optional(),
    dueDate: z.iso.datetime().optional().nullable(),
    note: z.string().optional().nullable()
});
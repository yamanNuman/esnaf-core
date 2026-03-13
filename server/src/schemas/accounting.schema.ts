import { z } from "zod";

export const dailyEntrySchema = z.object({
    date: z.iso.datetime(),
    brokenCash: z.number().min(0).default(0),
    expenses: z.number().min(0).default(0),
    cardAmount: z.number().min(0).default(0),
    cashAmount: z.number().min(0).default(0),
    setAside: z.number().min(0).default(0)
});

export const expenseSchema = z.object({
    date: z.iso.datetime(),
    description: z.string().min(1),
    amount: z.number().positive(),
});

export const fixedExpenseTemplateSchema = z.object({
    name: z.string().min(1),
    isActive: z.boolean().optional()
});

export const monthlyFixedExpenseSchema = z.object({
    description: z.string().min(1),
    amount: z.number().positive().optional(),
    dueDate: z.iso.datetime().optional(),
    paidAt: z.iso.datetime().optional().nullable(),
});

export const additionalIncomeTemplateSchema = z.object({
    name: z.string().min(1),
    dayOfMonth: z.number().min(1).max(31),
    isActive: z.boolean().optional()
});

export const monthlyAdditionalIncomeSchema = z.object({
    description: z.string().min(1),
    amount: z.number().positive().optional(),
    spentAmount: z.number().min(0).optional(),
    date: z.iso.datetime().optional(),
});

export const monthlyCarryoverSchema = z.object({
    amount: z.number().min(0),
});

export const generateMonthSchema = z.object({
    year: z.number().min(2024),
    month: z.number().min(1).max(12),
});
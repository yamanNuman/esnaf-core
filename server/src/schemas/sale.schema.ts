import { z } from "zod";

export const createSaleSchema = z.object({
    type: z.enum(["RECEIPT", "INVOICE"]).default("RECEIPT"),
    paymentType: z.enum(["CASH", "CARD", "MIXED"]),
    cardAmount: z.number().min(0).default(0),
    cashAmount: z.number().min(0).default(0),
    note: z.string().optional(),
    items: z.array(z.object({
        productId: z.number(),
        name: z.string(),
        priceType: z.enum(["PACKAGE", "PIECE"]),
        quantity: z.number().min(0.01),
        unitPrice: z.number().min(0),
        total: z.number().min(0)
    })).min(1),
    buyerName: z.string().optional(),
    buyerAddress: z.string().optional(),
    buyerTaxNo: z.string().optional(),
    buyerPhone: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(3, "Description must be at least 3 characters.").max(250, "Description must be at most 250 characters.").optional(),
    barcode: z.string().optional(),
    category: z.string().min(1, "Category is required."),
    unit: z.string().min(1, "Unit is required."),
    costPrices: z.array(z.object({
        type: z.enum(["PACKAGE","PIECE"]),
        price: z.number().positive("Price must be positive")
    })).min(1, "At least one cost price is required."),
    salePrices: z.array(z.object({
        label: z.string().min(1, "Label is required."),
        price: z.number().positive("Price must be positive.")
    })),
    stocks: z.array(z.object({
        type: z.enum(["PACKAGE","PIECE"]),
        quantity: z.number().min(0, "Quantity must be positive."),
        minQuantity: z.number().min(0).optional()
    })).min(1, "At least one stock entry is required.")
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
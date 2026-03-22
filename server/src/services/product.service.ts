import { prisma } from "../prisma/seed";
import appAssert from "../utils/appAssert";
import { NOT_FOUND } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export const createProductService = async(data: CreateProductInput) => {
    console.log("createProductService called", data);

    let barcode = data.barcode || null;
    if (!barcode) {
        // Benzersiz barkod üret — döngüyle çakışma kontrolü yap
        let unique = false;
        while (!unique) {
            const num = Date.now() % 1000000000000; // 12 hane
            const base = String(num).padStart(12, "0");
            const digits = base.split("").map(Number);
            const checkDigit = (10 - (digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0) % 10)) % 10;
            const candidate = base + checkDigit;
            
            // Çakışma kontrolü
            const existing = await prisma.product.findUnique({ where: { barcode: candidate } });
            if (!existing) {
                barcode = candidate;
                unique = true;
            }
            // Çakışırsa biraz bekle ve tekrar dene
            await new Promise(r => setTimeout(r, 1));
        }
    }
    const product = await prisma.product.create({
        data: {
            name: data.name,
            description: data.description,
            barcode: barcode,
            category: data.category,
            unit: data.unit,
            packageQuantity: data.packageQuantity,
            costPrices: {
                create: data.costPrices.map((cp) => ({
                    type: cp.type,
                    price: cp.price
                }))
            },
            salePrices: {
                create: data.salePrices.map((sp) => ({
                    label: sp.label,
                    price: sp.price
                }))
            },
            stocks: {
                create: data.stocks.map((s) => ({
                    type: s.type,
                    quantity: s.quantity,
                    minQuantity: s.minQuantity ?? 0
                }))
            }
        },
        include: {
            costPrices: true,
            salePrices: true,
            stocks: true
        }
    });
    return product;
};

export const getProductsService = async(filters : {
    category?:string,
    search?: string
}) => {
    const products = await prisma.product.findMany({
                where: {
            ...(filters.category && {
                category: {
                    contains: filters.category,
                    mode: "insensitive"
                }
            }),
            ...(filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: "insensitive" } },
                    { barcode: { contains: filters.search, mode: "insensitive" } }
                ]
            })
        },
        include: {
            costPrices: {
                orderBy: {createdAt: "desc" },
                distinct: ["type"]
            },  
            salePrices: {
                orderBy: { createdAt: "desc" },
                distinct: ["label"]
            },
            stocks: true
        },
        orderBy: { createdAt: "desc" }
    });
    return products;
};

export const getProductService = async(id: number) => {
    const product = await prisma.product.findUnique({
        where: {id},
        include: {
            costPrices: { orderBy: { createdAt: "desc" }, take: 1},
            salePrices: { orderBy: { createdAt: "desc" }, distinct: ["label"]},
            stocks: true
        }
    });
    appAssert(
        product,
        NOT_FOUND,
        "Product not found",
        AppErrorCode.ProductNotFound
    );
    
    return product;
};

export const updateProductService = async(id: number, data: UpdateProductInput) => {
    const product =  await prisma.product.findUnique({
        where: { id }
    });

    appAssert(
        product,
        NOT_FOUND,
        "Product not found",
        AppErrorCode.ProductNotFound
    );

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            barcode: data.barcode,
            category: data.category,
            unit: data.unit,
            packageQuantity: data.packageQuantity,
            ...(data.salePrices && {
                salePrices: {
                    create: data.salePrices.map((sp) => ({
                        label: sp.label,
                        price: sp.price
                    }))
                }
            }),
            ...(data.costPrices && {
                costPrices: {
                    create: data.costPrices.map((cp) => ({
                        type: cp.type,
                        price: cp.price
                    }))
                }
            }),
            ...(data.stocks && {
                stocks: {
                    updateMany: data.stocks.map((s) => ({
                        where: { type: s.type },
                        data: {
                            quantity: s.quantity,
                            minQuantity: s.minQuantity ?? 0
                        }
                    }))
                }
            })
        },
        include: {
            costPrices: { orderBy: { createdAt: "desc" }, take: 1 },
            salePrices: { orderBy: { createdAt: "desc" }, distinct: ["label"]},
            stocks: true
        }
    });
    return updatedProduct;
};

export const deleteProductService = async(id: number) => {
    const product = await prisma.product.findUnique({
        where: { id }
    });
    appAssert(
        product,
        NOT_FOUND,
        "Product not found",
        AppErrorCode.ProductNotFound
    );

    await prisma.product.delete({ where: { id }});
};

export const getPriceHistoryService = async(id: number) => {
    const product = await prisma.product.findUnique({
        where: { id }
    });

    appAssert(
        product,
        NOT_FOUND,
        "Product not found",
        AppErrorCode.ProductNotFound
    );

    const costPriceHistory =  await prisma.productCostPrice.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" }
    });

    const salePriceHistory = await prisma.productSalePrice.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" }
    });

    return {
        costPriceHistory,
        salePriceHistory
    };
};

export const getCategoriesService = async () => {
    const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" }
    });

    return categories.map(c => c.category);
};

export const generateBarcodesService = async () => {
    const products = await prisma.product.findMany({
        where: { barcode: null },
        select: { id: true }
    });

    const count = await prisma.product.count();
    let updated = 0;

    for (let i = 0; i < products.length; i++) {
        const base = String(count - products.length + i + 1).padStart(12, "0");
        const digits = base.split("").map(Number);
        const checkDigit = (10 - (digits.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0) % 10)) % 10;
        const barcode = base + checkDigit;

        await prisma.product.update({
            where: { id: products[i].id },
            data: { barcode }
        });
        updated++;
    }

    return { updated };
};
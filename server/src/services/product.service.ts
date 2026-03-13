import { prisma } from "../prisma/seed";
import appAssert from "../utils/appAssert";
import { NOT_FOUND } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export const createProductService = async(data: CreateProductInput) => {
    console.log("createProductService called", data);
    const product = await prisma.product.create({
        data: {
            name: data.name,
            description: data.description,
            barcode: data.barcode,
            category: data.category,
            unit: data.unit,
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
            costPrices: { orderBy: { createdAt: "desc" }},
            salePrices: { orderBy: { createdAt: "desc" }},
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
            ...(data.salePrices && {
                salePrices: {
                    deleteMany: {}, // önce hepsini sil
                    create: data.salePrices.map((sp) => ({
                        label: sp.label,
                        price: sp.price
                    }))
                }
            }),
            ...(data.costPrices && {
                costPrices: {
                    deleteMany: {}, // önce hepsini sil
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
            salePrices: { orderBy: { createdAt: "desc" }},
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
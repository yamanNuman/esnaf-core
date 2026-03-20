import AppErrorCode from "../constants/appErrorCode";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http";
import { prisma } from "../prisma/seed";
import { CreateSaleInput } from "../schemas/sale.schema";
import appAssert from "../utils/appAssert";


const generateReceiptNo = async (type: "RECEIPT" | "INVOICE") => {
    const year = new Date().getFullYear();
    const prefix = type === "RECEIPT" ? "F" : "INV";
    const count = await prisma.sale.count({
        where: {
            type,
            createdAt: { gte: new Date(year, 0, 1)}
        }
    });

    return `${prefix}-${year}-${String(count + 1).padStart(3, "0")}`;
};

export const createSaleService = async (data: CreateSaleInput) => {
    for (const item of data.items) {
        const stock = await prisma.productStock.findFirst({
            where: { productId: item.productId, type: item.priceType }
        });

        appAssert(
            stock, 
            NOT_FOUND, 
            `Ürün stoğu bulunamadı`, 
            AppErrorCode.ProductNotFound
        );

        appAssert(
            Number(stock.quantity) >= item.quantity,
            BAD_REQUEST,
            `${item.name} için yeterli stok yok. Mevcut: ${stock.quantity}`,
            AppErrorCode.ProductNotFound
        );
    }

    const totalAmount = data.items.reduce((acc, i) => acc + i.total, 0);
    const receiptNo = await generateReceiptNo(data.type);

    const sale = await prisma.$transaction(async (tx) => {
        const created = await tx.sale.create({
            data: {
                receiptNo,
                type: data.type,
                paymentType: data.paymentType,
                cardAmount: data.cardAmount,
                cashAmount: data.cashAmount,
                totalAmount,
                note: data.note,
                items: {
                    create: data.items.map(i => ({
                        productId: i.productId,
                        name: i.name,
                        priceType: i.priceType,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        total: i.total,
                    }))
                }
            },
            include: { items: { include: { product: true }}}
        });

        for(const item of data.items) {
            await tx.productStock.updateMany({
                where: { productId: item.productId, type: item.priceType },
                data: { quantity: { decrement: item.quantity }}
            });
        }
        return created;
    });
    return sale;
};

export const getSalesService = async (filters: { type?: string; page?: number }) => {
    const page = filters.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = filters.type ? { type: filters.type as "RECEIPT" | "INVOICE" } : {};

    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.sale.count({ where })
    ]);

    return { sales, total, page, totalPages: Math.ceil(total / limit) };
};

export const getSaleService = async (id: number) => {
    const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
            items: {
                include: { product: { select: { name: true, unit: true } } }
            }
        }
    });
    appAssert(sale, NOT_FOUND, "Fiş bulunamadı", AppErrorCode.ProductNotFound);
    return sale;
};

export const deleteSaleService = async (id: number) => {
    const sale = await prisma.sale.findUnique({
        where: { id },
        include: { items: true }
    });
    appAssert(sale, NOT_FOUND, "Fiş bulunamadı", AppErrorCode.ProductNotFound);

    // Stok geri yükle
    await prisma.$transaction(async (tx) => {
        for (const item of sale.items) {
            await tx.productStock.updateMany({
                where: { productId: item.productId, type: item.priceType },
                data: { quantity: { increment: Number(item.quantity) } }
            });
        }
        await tx.sale.delete({ where: { id } });
    });
};
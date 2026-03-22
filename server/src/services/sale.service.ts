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
                buyerName: data.buyerName,
                buyerAddress: data.buyerAddress,
                buyerTaxNo: data.buyerTaxNo,
                buyerPhone: data.buyerPhone,
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

for (const item of data.items) {
    if (item.priceType === "PACKAGE") {
        // Koli satışı — direkt koli stoktan düş
        await tx.productStock.updateMany({
            where: { productId: item.productId, type: "PACKAGE" },
            data: { quantity: { decrement: item.quantity } }
        });
    } else {
        // Adet satışı — önce adet stoktan düş, yetmiyorsa koliden aç
        const pieceStock = await tx.productStock.findFirst({
            where: { productId: item.productId, type: "PIECE" }
        });
        const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { packageQuantity: true }
        });

        const currentPiece = Number(pieceStock?.quantity || 0);
        const needed = item.quantity;

        if (currentPiece >= needed) {
            // Adet stoğu yeterli, direkt düş
            await tx.productStock.updateMany({
                where: { productId: item.productId, type: "PIECE" },
                data: { quantity: { decrement: needed } }
            });
        } else if (product?.packageQuantity) {
            // Adet stoğu yetersiz, koliden aç
            const remaining = needed - currentPiece;
            const packageQuantity = product.packageQuantity;
            const packagesToOpen = Math.ceil(remaining / packageQuantity);
            const extraPieces = (packagesToOpen * packageQuantity) - remaining;

            // Adet stoğunu sıfırla + koliden açılan fazlayı ekle
            await tx.productStock.updateMany({
                where: { productId: item.productId, type: "PIECE" },
                data: { quantity: extraPieces }
            });

            // Koli stoktan düş
            await tx.productStock.updateMany({
                where: { productId: item.productId, type: "PACKAGE" },
                data: { quantity: { decrement: packagesToOpen } }
            });
        } else {
            // packageQuantity tanımlı değil, direkt düş
            await tx.productStock.updateMany({
                where: { productId: item.productId, type: "PIECE" },
                data: { quantity: { decrement: needed } }
            });
        }
    }
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

export const getSalesReportService = async (filters: {
    period: "today" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
}) => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (filters.period === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (filters.period === "week") {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    } else if (filters.period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (filters.period === "year") {
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
        start = new Date(filters.startDate || now);
        end = new Date(filters.endDate || now);
        end.setHours(23, 59, 59);
    }

    const sales = await prisma.sale.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { items: true },
        orderBy: { createdAt: "asc" }
    });

    // Özet
    const totalRevenue = sales.reduce((acc, s) => acc + Number(s.totalAmount), 0);
    const totalSales = sales.length;
    const avgSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0;
    const receiptCount = sales.filter(s => s.type === "RECEIPT").length;
    const invoiceCount = sales.filter(s => s.type === "INVOICE").length;
    const cashTotal = sales.reduce((acc, s) => acc + Number(s.cashAmount), 0);
    const cardTotal = sales.reduce((acc, s) => acc + Number(s.cardAmount), 0);

    // Dönem bazlı gruplama
    const periodMap = new Map<string, number>();

    if (filters.period === "today") {
        // Saatlik
        for (let h = 0; h < 24; h++) {
            periodMap.set(`${String(h).padStart(2, "0")}:00`, 0);
        }
        sales.forEach(s => {
            const hour = new Date(s.createdAt).getHours();
            const key = `${String(hour).padStart(2, "0")}:00`;
            periodMap.set(key, (periodMap.get(key) || 0) + Number(s.totalAmount));
        });
    } else if (filters.period === "year") {
        // Aylık
        const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        months.forEach(m => periodMap.set(m, 0));
        sales.forEach(s => {
            const month = months[new Date(s.createdAt).getMonth()];
            periodMap.set(month, (periodMap.get(month) || 0) + Number(s.totalAmount));
        });
    } else {
        // Günlük
        const current = new Date(start);
        while (current <= end) {
            const key = `${current.getDate()}/${current.getMonth() + 1}`;
            periodMap.set(key, 0);
            current.setDate(current.getDate() + 1);
        }
        sales.forEach(s => {
            const d = new Date(s.createdAt);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            periodMap.set(key, (periodMap.get(key) || 0) + Number(s.totalAmount));
        });
    }

    const chartData = Array.from(periodMap.entries()).map(([label, value]) => ({ label, value }));

    // En çok satılan ürünler
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    sales.forEach(s => {
        s.items.forEach(item => {
            const existing = productMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
            productMap.set(item.name, {
                name: item.name,
                quantity: existing.quantity + Number(item.quantity),
                revenue: existing.revenue + Number(item.total),
            });
        });
    });
    const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue);

    return {
        summary: { totalRevenue, totalSales, avgSaleAmount, receiptCount, invoiceCount, cashTotal, cardTotal },
        chartData,
        topProducts,
        period: filters.period,
        start: start.toISOString(),
        end: end.toISOString(),
    };
};
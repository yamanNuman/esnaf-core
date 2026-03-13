import { prisma } from "../prisma/seed";
import appAssert from "../utils/appAssert";
import { NOT_FOUND } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export const getDebtsService = async (filters: { search?: string }) => {
    const debts = await prisma.debt.findMany({
        where: {
            ...(filters.search && {
                name: { contains: filters.search, mode: "insensitive" }
            })
        },
        include: {
            transactions: {
                orderBy: { createdAt: "desc" },
                distinct: ["type"]
            }
        },
        orderBy: { updatedAt: "desc" }
    });

    return debts;
};

export const getRecentTransactionsService = async (limit: number = 10) => {
    const transactions = await prisma.debtTransaction.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            debt: { select: { name: true } }
        }
    });
    return transactions;
};

export const getDebtService = async (id: number) => {
    const debt = await prisma.debt.findUnique({
        where: { id },
        include: {
            transactions: {
                orderBy: { createdAt: "desc" }
            }
        }
    });

    appAssert(debt, NOT_FOUND, "Debt not found", AppErrorCode.DebtNotFound);

    return debt;
};

export const createDebtService = async (data: {
    name: string;
    dueDate?: string;
    note?: string;
    initialDebt?: number;
}) => {
    const debt = await prisma.debt.create({
        data: {
            name: data.name,
            totalDebt: data.initialDebt || 0,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            note: data.note,
            ...(data.initialDebt && {
                transactions: {
                    create: {
                        type: "PURCHASE",
                        amount: data.initialDebt,
                        note: "Starting debt"
                    }
                }
            })
        }
    });

    return debt;
};

export const createTransactionService = async (debtId: number, data: {
    type: "PURCHASE" | "PAYMENT";
    amount: number;
    note?: string;
    date?: string;
}) => {
    const debt = await prisma.debt.findUnique({ where: { id: debtId } });
    appAssert(debt, NOT_FOUND, "Debt not found", AppErrorCode.DebtNotFound);

    const newTotal = data.type === "PURCHASE"
        ? debt.totalDebt + data.amount
        : debt.totalDebt - data.amount;

    const [transaction] = await prisma.$transaction([
        prisma.debtTransaction.create({
            data: {
                debtId,
                type: data.type,
                amount: data.amount,
                note: data.note,
                date: data.date ? new Date(data.date) : new Date()
            }
        }),
        prisma.debt.update({
            where: { id: debtId },
            data: { totalDebt: newTotal }
        })
    ]);

    return transaction;
};

export const updateDebtService = async (id: number, data: {
    name?: string;
    dueDate?: string | null;
    note?: string | null;
}) => {
    const debt = await prisma.debt.findUnique({ where: { id } });
    appAssert(debt, NOT_FOUND, "Debt not found", AppErrorCode.DebtNotFound);

    return await prisma.debt.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
            ...(data.note !== undefined && { note: data.note })
        }
    });
};

export const deleteDebtService = async (id: number) => {
    const debt = await prisma.debt.findUnique({ where: { id } });
    appAssert(debt, NOT_FOUND, "Debt not found", AppErrorCode.DebtNotFound);
    await prisma.debt.delete({ where: { id } });
};

export const getDebtNamesService = async () => {
    const debts = await prisma.debt.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" }
    });
    return debts;
};
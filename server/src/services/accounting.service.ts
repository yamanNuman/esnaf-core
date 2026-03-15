import AppErrorCode from "../constants/appErrorCode";
import { NOT_FOUND, CONFLICT } from "../constants/http";
import { prisma } from "../prisma/seed";
import appAssert from "../utils/appAssert";

//DAILY ENTRY
export const getDailyEntriesService = async (year: number, month: number) => {
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59);

    return await prisma.dailyEntry.findMany({
        where: { date: { gte: start, lte: end}},
        orderBy: { date: "asc"}
    });
};

export const upsertDailyEntryService = async (data : {
    date: string,
    brokenCash: number;
    expenses: number;
    cardAmount: number;
    cashAmount: number;
    setAside: number;
}) => {
    const date = new Date(data.date);
    date.setHours(12, 0, 0, 0);

    return await prisma.dailyEntry.upsert({
        where: { date },
        update: {
            brokenCash: data.brokenCash,
            expenses: data.expenses,
            cardAmount: data.cardAmount,
            cashAmount: data.cashAmount,
            setAside: data.setAside
        },
        create: {
            date,
            brokenCash: data.brokenCash,
            expenses: data.expenses,
            cardAmount: data.cardAmount,
            cashAmount: data.cashAmount,
            setAside: data.setAside
        }
    });
};

export const deleteDailyEntryService = async (id: number) => {
    const entry = await prisma.dailyEntry.findUnique({
        where : { id }
    });

    appAssert(
        entry,
        NOT_FOUND,
        "Daily entry not found",
        AppErrorCode.DailyEntryNotFound
    );
    await prisma.dailyEntry.delete({
        where: { id }
    });
}

//EXPENSE
export const getExpenseService = async (year: number, month: number) => {
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59);

    return await prisma.expense.findMany({
        where: { date: { gte: start, lte: end}},
        orderBy: { date: "asc"}
    });
};

export const createExpenseService = async (data: {
    date: string;
    description: string;
    amount: number
}) => {
    return await prisma.expense.create({
        data: {
            date: new Date(data.date),
            description: data.description,
            amount: data.amount
        }
    });
};

export const updateExpenseService = async (id: number, data: {
    date?: string;
    description?: string;
    amount?: number
}) => {
    const expense = await prisma.expense.findUnique({
        where: { id }
    });
    appAssert(
        expense,
        NOT_FOUND,
        "Expense not found",
        AppErrorCode.ExpenseNotFound
    );

    return await prisma.expense.update({
        where: { id },
        data: {
            ...(data.date && { date: new Date(data.date )}),
            ...(data.description && { description: data.description}),
            ...(data.amount && { amount: data.amount }),
        }
    });
};

export const deleteExpenseService =  async (id: number) => {
    const expense = await prisma.expense.findUnique({ where: {id} });
    appAssert(
        expense,
        NOT_FOUND,
        "Expense not found",
        AppErrorCode.ExpenseNotFound
    );
    await prisma.expense.delete({where: { id }});
}

export const getFixedExpenseTemplatesService = async () => {
    return await prisma.fixedExpenseTemplate.findMany({
        orderBy: { name: "asc" }
    });
};

export const createFixedExpenseTemplateService = async (data: { name: string }) => {
    return await prisma.fixedExpenseTemplate.create({ data });
};

export const updateFixedExpenseTemplateService = async (id: number, data: { name?: string; isActive?: boolean }) => {
    const template = await prisma.fixedExpenseTemplate.findUnique({ where: { id } });
    appAssert(template, NOT_FOUND, "Template not found", AppErrorCode.FixedExpenseTemplateNotFound);
    return await prisma.fixedExpenseTemplate.update({ where: { id }, data });
};

export const deleteFixedExpenseTemplateService = async (id: number) => {
    const template = await prisma.fixedExpenseTemplate.findUnique({ where: { id } });
    appAssert(template, NOT_FOUND, "Template not found", AppErrorCode.FixedExpenseTemplateNotFound);
    await prisma.fixedExpenseTemplate.delete({ where: { id } });
};

//ADDITIONAL INCOME TEMPLATE

export const getAdditionalIncomeTemplatesService = async () => {
    return await prisma.additionalIncomeTemplate.findMany({
        orderBy: { name: "asc" }
    });
};

export const createAdditionalIncomeTemplateService = async (data: { name: string; dayOfMonth: number }) => {
    return await prisma.additionalIncomeTemplate.create({ data });
};

export const updateAdditionalIncomeTemplateService = async (id: number, data: { name?: string; dayOfMonth?: number; isActive?: boolean }) => {
    const template = await prisma.additionalIncomeTemplate.findUnique({ where: { id } });
    appAssert(template, NOT_FOUND, "Template not found", AppErrorCode.AdditionalIncomeTemplateNotFound);
    return await prisma.additionalIncomeTemplate.update({ where: { id }, data });
};

export const deleteAdditionalIncomeTemplateService = async (id: number) => {
    const template = await prisma.additionalIncomeTemplate.findUnique({ where: { id } });
    appAssert(template, NOT_FOUND, "Template not found", AppErrorCode.AdditionalIncomeTemplateNotFound);
    await prisma.additionalIncomeTemplate.delete({ where: { id } });
};

//GENERATE MONTH
export const generateMonthService = async (year: number, month: number) => {
    const existing = await prisma.monthlyFixedExpense.findFirst({
        where: { year, month }
    });
    appAssert(!existing, CONFLICT, `${year}/${month} has already been created.`, AppErrorCode.MonthlyAlreadyExists);

    const templates = await prisma.fixedExpenseTemplate.findMany({ where: { isActive: true } });
    for (const t of templates) {
        await prisma.monthlyFixedExpense.create({
            data: { year, month, description: t.name, templateId: t.id }
        });
    }

    const taxes = await prisma.tax.findMany({
        where: {
            dueDate: {
                gte: new Date(year, month - 1, 1, 0, 0, 0),
                lte: new Date(year, month, 0, 23, 59, 59)
            }
        }
    });
    const taxLabels: Record<string, string> = {
        KDV_DAMGA: "KDV & Damga",
        GECICI_VERGI: "Geçici Vergi",
        STOPAJ: "Stopaj",
        YILLIK_VERGI: "Yıllık Vergi"
    };
    for (const tax of taxes) {
        await prisma.monthlyFixedExpense.create({
            data: {
                year, month,
                description: taxLabels[tax.type],
                amount: tax.amount ?? undefined,
                dueDate: tax.dueDate
            }
        });
    }

    const incomeTemplates = await prisma.additionalIncomeTemplate.findMany({ where: { isActive: true } });
    for (const t of incomeTemplates) {
        await prisma.monthlyAdditionalIncome.create({
            data: {
                year, month,
                description: t.name,
                templateId: t.id,
                date: new Date(year, month - 1, t.dayOfMonth, 12, 0, 0)
            }
        });
    }

    return { message: `${year}/${month} was created.` };
};

//MONTHLY FIXED EXPENSE

export const getMonthlyFixedExpensesService = async (year: number, month: number) => {
    return await prisma.monthlyFixedExpense.findMany({
        where: { year, month },
        orderBy: { dueDate: "asc" }
    });
};

export const createMonthlyFixedExpenseService = async (year: number, month: number, data: {
    description: string;
    amount?: number;
    dueDate?: string;
}) => {
    return await prisma.monthlyFixedExpense.create({
        data: { year, month, ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined }
    });
};

export const updateMonthlyFixedExpenseService = async (id: number, data: {
    description?: string;
    amount?: number;
    dueDate?: string;
    paidAt?: string | null;
}) => {
    const expense = await prisma.monthlyFixedExpense.findUnique({ where: { id } });
    appAssert(expense, NOT_FOUND, "Monthly fixed expense not found", AppErrorCode.MonthlyFixedExpenseNotFound);

    return await prisma.monthlyFixedExpense.update({
        where: { id },
        data: {
            ...(data.description && { description: data.description }),
            ...(data.amount !== undefined && { amount: data.amount }),
            ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
            ...(data.paidAt !== undefined && { paidAt: data.paidAt ? new Date(data.paidAt) : null }),
        }
    });
};

export const deleteMonthlyFixedExpenseService = async (id: number) => {
    const expense = await prisma.monthlyFixedExpense.findUnique({ where: { id } });
    appAssert(expense, NOT_FOUND, "Monthly fixed expense not found", AppErrorCode.MonthlyFixedExpenseNotFound);
    await prisma.monthlyFixedExpense.delete({ where: { id } });
};

//MONTHLY ADDITIONAL INCOME

export const getMonthlyAdditionalIncomesService = async (year: number, month: number) => {
    return await prisma.monthlyAdditionalIncome.findMany({
        where: { year, month },
        orderBy: { date: "asc" }
    });
};

export const updateMonthlyAdditionalIncomeService = async (id: number, data: {
    amount?: number;
    spentAmount?: number;
    date?: string;
}) => {
    const income = await prisma.monthlyAdditionalIncome.findUnique({ where: { id } });
    appAssert(income, NOT_FOUND, "Monthly additional income not found", AppErrorCode.MonthlyAdditionalIncomeNotFound);

    return await prisma.monthlyAdditionalIncome.update({
        where: { id },
        data: {
            ...(data.amount !== undefined && { amount: data.amount }),
            ...(data.spentAmount !== undefined && { spentAmount: data.spentAmount }),
            ...(data.date !== undefined && { date: new Date(data.date) }),
        }
    });
};

//MONTHLY CARRYOVER

export const upsertMonthlyCarryoverService = async (year: number, month: number, amount: number) => {
    return await prisma.monthlyCarryover.upsert({
        where: { year_month: { year, month } },
        update: { amount },
        create: { year, month, amount }
    });
};

export const getMonthlyCarryoverService = async (year: number, month: number) => {
    return await prisma.monthlyCarryover.findUnique({
        where: { year_month: { year, month } }
    });
};

//MONTHLY SUMMARY
export const getMonthlySummaryService = async (year: number, month: number) => {
    const [dailyEntries, expenses, additionalIncomes, setAsideTransactions, carryover] = await Promise.all([
        prisma.dailyEntry.findMany({ where: { date: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0, 23, 59, 59) } } }),
        prisma.expense.findMany({ where: { date: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0, 23, 59, 59) } } }),
        prisma.monthlyAdditionalIncome.findMany({ where: { year, month } }),
        prisma.setAsideTransaction.findMany({ where: { year, month } }),
        prisma.monthlyCarryover.findUnique({ where: { year_month: { year, month } } })
    ]);

    const totalRevenue = dailyEntries.reduce((acc, e) => acc + Number(e.brokenCash) + Number(e.expenses) + Number(e.cardAmount) + Number(e.cashAmount) + Number(e.setAside), 0);
    const totalSetAside = dailyEntries.reduce((acc, e) => acc + Number(e.setAside), 0);
    const totalRemaining = dailyEntries.reduce((acc, e) => acc + (Number(e.cardAmount) - Number(e.cardAmount) * 0.01 + Number(e.cashAmount) + Number(e.setAside)), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const totalAdditionalIncome = additionalIncomes.reduce((acc, i) => acc + (i.amount ? Number(i.amount) : 0), 0);
    const totalSpentFromIncome = additionalIncomes.reduce((acc, i) => acc + (i.spentAmount ? Number(i.spentAmount) : 0), 0);
    const totalSetAsideSpent = setAsideTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
    const carryoverAmount = carryover ? Number(carryover.amount) : 0;

    return {
        totalRevenue,
        totalRemaining,
        totalSetAside,
        totalSetAsideSpent,
        totalExpenses,
        totalAdditionalIncome,
        totalSpentFromIncome,
        carryoverAmount,
        shopRemaining: totalRemaining - totalExpenses,
        generalRemaining: totalRemaining - totalExpenses + totalAdditionalIncome + (totalSetAside - totalSetAsideSpent),
        inPocket: totalRemaining - totalSetAside + totalSetAsideSpent + carryoverAmount - totalExpenses + totalSpentFromIncome,
        totalCardCommission: dailyEntries.reduce((acc, e) => acc + Number(e.cardAmount) * 0.01, 0),
        totalBrokenCash: dailyEntries.reduce((acc, e) => acc + Number(e.brokenCash), 0),
        totalDailyExpenses: dailyEntries.reduce((acc, e) => acc + Number(e.expenses), 0),
    };
};

export const checkMonthExistsService = async (year: number, month: number) => {
    const existing = await prisma.monthlyFixedExpense.findFirst({ where: { year, month } });
    return !!existing;
};

//SET ASIDE

export const getSetAsideTransactionsService = async (year: number, month: number) => {
    return await prisma.setAsideTransaction.findMany({
        where: {year, month},
        orderBy: { createdAt: "desc"}
    });
};

export const createSetAsideTransactionService = async (year: number, month: number, data : {
    description: string, amount: number}) => {
    return await prisma.setAsideTransaction.create({
        data: { year, month, ...data}
    });
};

export const deleteSetAsideTransactionService = async (id: number) => {
    await prisma.setAsideTransaction.delete({ where: { id }});
};
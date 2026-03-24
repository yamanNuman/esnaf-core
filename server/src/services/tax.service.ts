import { prisma } from "../prisma/seed";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, CONFLICT } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export const generateTaxCalendarService =  async (year:number) => {
    const existing =  await prisma.tax.findFirst({
        where: { period: { startsWith: `${year}`}}
    });

    appAssert(
        !existing,
        CONFLICT,
        `${year} calendar has already been created.`,
        AppErrorCode.TaxCalendarAlreadyExists
    );

    const taxes = [];

    //KDV_DAMGA 28th
    for(let month = 1; month <= 12; month++) {
        taxes.push({
            type: "KDV_DAMGA" as const,
            period: `${year}-${String(month).padStart(2, "0")}`,
            dueDate: new Date(year, month - 1, 28, 12, 0, 0)
        });
    }

    //GECICI_VERGI
    taxes.push(
        { type: "GECICI_VERGI" as const, period: `${year}-Q1`, dueDate: new Date(year, 4, 17, 12, 0, 0)},
        { type: "GECICI_VERGI" as const, period: `${year}-Q2`, dueDate: new Date(year, 7, 18, 12, 0, 0)},
        { type: "GECICI_VERGI" as const, period: `${year}-Q3`, dueDate: new Date(year, 10, 17, 12, 0, 0)},
        { type: "GECICI_VERGI" as const, period: `${year}-Q4`, dueDate: new Date(year + 1, 1, 17, 12, 0, 0)},
    );

    //STOPAJ
    taxes.push(
        { type: "STOPAJ" as const, period: `${year}-S1`, dueDate: new Date(year, 0, 26, 12, 0, 0)},
        { type: "STOPAJ" as const, period: `${year}-S2`, dueDate: new Date(year, 3, 26, 12, 0, 0)},
        { type: "STOPAJ" as const, period: `${year}-S3`, dueDate: new Date(year, 6, 26, 12, 0, 0)},
        { type: "STOPAJ" as const, period: `${year}-S4`, dueDate: new Date(year, 9, 26, 12, 0, 0)},
    );

    //YILLIK_VERGI
    taxes.push(
        { type: "YILLIK_VERGI" as const, period: `${year}-T1`, dueDate: new Date(year,2,31, 12, 0, 0)},
        { type: "YILLIK_VERGI" as const, period: `${year}-T2`, dueDate: new Date(year,6,31, 12, 0, 0)},
    );

    await prisma.tax.createMany({ data: taxes});

    return taxes.length;
};

export const getTaxService = async (year: number, type?: string) => {
    const taxes = await prisma.tax.findMany({
        where: {
            period: { startsWith: `${year}`},
            ...(type && { type: type as any})
        },
        orderBy: { dueDate: "asc"}
    });

    return taxes.map(t => ({
        ...t,
        amount: t.amount ? Number(t.amount) : null,
        paidAmount: t.paidAmount? Number(t.paidAmount) : null
    }));
};

export const updateTaxService = async (id: number, data: {
    amount?: number;
    paidAmount?: number;
    paidAt?: string | null;
    note?: string | null;
}) => {
    const tax = await prisma.tax.findUnique({where: {id}});
    appAssert(
        tax,
        NOT_FOUND,
        "Tax not found",
        AppErrorCode.TaxNotFound
    );

    const updated = await prisma.tax.update({
        where: { id },
        data: {
            ...(data.amount !== undefined && { amount: data.amount}),
            ...(data.paidAmount !== undefined && { paidAmount: data.paidAmount}),
            ...(data.paidAt !== undefined && { paidAt: data.paidAt}),
            ...(data.note !== undefined && { note: data.note}),
        }
    });

    return {
        ...updated,
        amount: updated.amount ? Number (updated.amount) : null,
        paidAmount: updated.paidAmount ? Number(updated.paidAmount) : null
    };
};
import type { AxiosError } from "axios";

export type User = {
    id: number;
    name: string;
    email: string;
    verified: boolean;
    role: "USER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
};

export type AuthResponse = {
    message: string;
    user: User;
};

export type ErrorResponse = {
    message: string;
    errorCode?: string;
}

export type RegisterInput = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type LoginInput = {
    email: string;
    password: string;
};

export type CostPrice = {
    id: number;
    productId: number;
    type: "PACKAGE" | "PIECE";
    price: number;
    createdAt: string;
};

export type SalePrice = {
    id: number;
    productId: number;
    label: string;
    price: number;
    createdAt: string;
};

export type Stock = {
    id: number;
    productId: number;
    type: "PACKAGE" | "PIECE";
    quantity: number;
    minQuantity: number;
    updatedAt: string;
};

export type Product = {
    id: number;
    name: string;
    description?: string;
    barcode?: string;
    category: string;
    unit: string;
    createdAt: string;
    updatedAt: string;
    costPrices: CostPrice[];
    salePrices: SalePrice[];
    stocks: Stock[];
};

export type PriceHistory = {
    costPriceHistory: CostPrice[];
    salePriceHistory: SalePrice[];
};

export type DebtTransaction = {
    id: number;
    debtId: number;
    type: "PURCHASE" | "PAYMENT";
    amount: number;
    note?: string;
    date?: string;
    createdAt: string;
};

export type Debt = {
    id: number;
    name: string;
    totalDebt: number;
    dueDate?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
    transactions: DebtTransaction[];
};

export type Tax = {
    id: number;
    type: "KDV_DAMGA" | "GECICI_VERGI" | "STOPAJ" | "YILLIK_VERGI";
    period: string;
    dueDate: string;
    amount: number | null;
    paidAt: string | null;
    paidAmount: number | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
};

export type DailyEntry = {
    id: number;
    date: string;
    brokenCash: number;
    expenses: number;
    cardAmount: number;
    cashAmount: number;
    setAside: number;
    createdAt: string;
    updatedAt: string;
};

export type Expense = {
    id: number;
    date: string;
    description: string;
    amount: number;
    createdAt: string;
};

export type FixedExpenseTemplate = {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
};

export type AdditionalIncomeTemplate = {
    id: number;
    name: string;
    dayOfMonth: number;
    isActive: boolean;
    createdAt: string;
};

export type MonthlyFixedExpense = {
    id: number;
    year: number;
    month: number;
    description: string;
    amount: number | null;
    dueDate: string | null;
    paidAt: string | null;
    templateId: number | null;
    createdAt: string;
    updatedAt: string;
};

export type MonthlyAdditionalIncome = {
    id: number;
    year: number;
    month: number;
    description: string;
    amount: number | null;
    spentAmount: number | null;
    date: string | null;
    templateId: number | null;
    createdAt: string;
    updatedAt: string;
};

export type MonthlyCarryover = {
    id: number;
    year: number;
    month: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
};

export type MonthlySummary = {
    totalRevenue: number;
    totalRemaining: number;
    totalSetAside: number;
    totalSetAsideSpent: number;
    totalExpenses: number;
    totalAdditionalIncome: number;
    totalSpentFromIncome: number;
    carryoverAmount: number;
    shopRemaining: number;
    generalRemaining: number;
    inPocket: number;
    totalCardCommission: number;
    totalBrokenCash: number;
    totalDailyExpenses: number;
};

export type SetAsideTransaction = {
    id: number;
    year: number;
    month: number;
    description: string;
    amount: number;
    createdAt: string;
}

export type SaleItem = {
    id: number;
    saleId: number;
    productId: number;
    name: string;
    priceType: "PACKAGE" | "PIECE";
    quantity: number;
    unitPrice: number;
    total: number;
};

export type Sale = {
    id: number;
    receiptNo: string;
    type: "RECEIPT" | "INVOICE";
    paymentType: "CASH" | "CARD" | "MIXED";
    cardAmount: number;
    cashAmount: number;
    totalAmount: number;
    note?: string;
    createdAt: string;
    items: SaleItem[];
    buyerName?: string;
    buyerAddress?: string;
    buyerTaxNo?: string;
    buyerPhone?: string;
};

export type ApiError = AxiosError<{ message: string; errorCode?: string }>;
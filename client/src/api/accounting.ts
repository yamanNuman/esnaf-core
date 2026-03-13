import api from "./axios";

export const getDailyEntriesApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/daily", { params: { year, month } });
    return response.data;
};

export const upsertDailyEntryApi = async (data: {
    date: string;
    brokenCash: number;
    expenses: number;
    cardAmount: number;
    cashAmount: number;
    setAside: number;
}) => {
    const response = await api.post("/accounting/daily", data);
    return response.data;
};

export const deleteDailyEntryApi = async (id: number) => {
    const response = await api.delete(`/accounting/daily/${id}`);
    return response.data;
};

export const getExpensesApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/expenses", { params: { year, month } });
    return response.data;
};

export const createExpenseApi = async (data: { date: string; description: string; amount: number }) => {
    const response = await api.post("/accounting/expenses", data);
    return response.data;
};

export const updateExpenseApi = async (id: number, data: { date?: string; description?: string; amount?: number }) => {
    const response = await api.put(`/accounting/expenses/${id}`, data);
    return response.data;
};

export const deleteExpenseApi = async (id: number) => {
    const response = await api.delete(`/accounting/expenses/${id}`);
    return response.data;
};

export const getFixedExpenseTemplatesApi = async () => {
    const response = await api.get("/accounting/templates/fixed");
    return response.data;
};

export const createFixedExpenseTemplateApi = async (data: { name: string }) => {
    const response = await api.post("/accounting/templates/fixed", data);
    return response.data;
};

export const updateFixedExpenseTemplateApi = async (id: number, data: { name?: string; isActive?: boolean }) => {
    const response = await api.put(`/accounting/templates/fixed/${id}`, data);
    return response.data;
};

export const deleteFixedExpenseTemplateApi = async (id: number) => {
    const response = await api.delete(`/accounting/templates/fixed/${id}`);
    return response.data;
};

export const getAdditionalIncomeTemplatesApi = async () => {
    const response = await api.get("/accounting/templates/income");
    return response.data;
};

export const createAdditionalIncomeTemplateApi = async (data: { name: string; dayOfMonth: number }) => {
    const response = await api.post("/accounting/templates/income", data);
    return response.data;
};

export const updateAdditionalIncomeTemplateApi = async (id: number, data: { name?: string; dayOfMonth?: number; isActive?: boolean }) => {
    const response = await api.put(`/accounting/templates/income/${id}`, data);
    return response.data;
};

export const deleteAdditionalIncomeTemplateApi = async (id: number) => {
    const response = await api.delete(`/accounting/templates/income/${id}`);
    return response.data;
};

export const generateMonthApi = async (year: number, month: number) => {
    const response = await api.post("/accounting/generate", { year, month });
    return response.data;
};

export const getMonthlyFixedExpensesApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/monthly/fixed", { params: { year, month } });
    return response.data;
};

export const createMonthlyFixedExpenseApi = async (year: number, month: number, data: { description: string; amount?: number; dueDate?: string }) => {
    const response = await api.post("/accounting/monthly/fixed", data, { params: { year, month } });
    return response.data;
};

export const updateMonthlyFixedExpenseApi = async (id: number, data: { description?: string; amount?: number; dueDate?: string; paidAt?: string | null }) => {
    const response = await api.put(`/accounting/monthly/fixed/${id}`, data);
    return response.data;
};

export const deleteMonthlyFixedExpenseApi = async (id: number) => {
    const response = await api.delete(`/accounting/monthly/fixed/${id}`);
    return response.data;
};

export const getMonthlyAdditionalIncomesApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/monthly/income", { params: { year, month } });
    return response.data;
};

export const updateMonthlyAdditionalIncomeApi = async (id: number, data: { amount?: number; spentAmount?: number; date?: string }) => {
    const response = await api.put(`/accounting/monthly/income/${id}`, data);
    return response.data;
};

export const upsertMonthlyCarryoverApi = async (year: number, month: number, amount: number) => {
    const response = await api.post("/accounting/carryover", { amount }, { params: { year, month } });
    return response.data;
};

export const getMonthlySummaryApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/summary", { params: { year, month } });
    return response.data;
};

export const checkMonthExistsApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/check", { params: { year, month } });
    return response.data;
};

export const getSetAsideTransactionsApi = async (year: number, month: number) => {
    const response = await api.get("/accounting/set-aside", { params: { year, month } });
    return response.data;
};

export const createSetAsideTransactionApi = async (year: number, month: number, data: { description: string; amount: number }) => {
    const response = await api.post("/accounting/set-aside", data, { params: { year, month } });
    return response.data;
};

export const deleteSetAsideTransactionApi = async (id: number) => {
    const response = await api.delete(`/accounting/set-aside/${id}`);
    return response.data;
};
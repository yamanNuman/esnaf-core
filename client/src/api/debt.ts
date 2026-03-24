import api from "./axios";

export type CreateDebtInput = {
    name: string;
    dueDate?: string;
    note?: string;
    initialDebt?:number;
};

export type CreateTransactionInput = {
    type: "PURCHASE" | "PAYMENT";
    amount: number;
    note?: string;
    date?: string;
};

export const getDebtsApi = async (filters?: { search?: string }) => {
    const response = await api.get("/debts", { params: filters });
    return response.data;
};

export const getRecentTransactionsApi = async () => {
    const response = await api.get("/debts/recent-transactions");
    return response.data;
};

export const getDebtApi = async (id: number) => {
    const response = await api.get(`/debts/${id}`);
    return response.data;
};

export const createDebtApi = async (data: CreateDebtInput) => {
    const response = await api.post("/debts", data);
    return response.data;
};

export const createTransactionApi = async (id: number, data: CreateTransactionInput) => {
    const response = await api.post(`/debts/${id}/transaction`, data);
    return response.data;
};

export const updateDebtApi = async (id: number, data: {
    name?: string;
    dueDate?: string | null;
    note?: string | null
}) => {
    const response = await api.put(`/debts/${id}`, data);
    return response.data;
};

export const deleteDebtApi = async (id: number) => {
    const response = await api.delete(`/debts/${id}`);
    return response.data;
};

export const getDebtNamesApi = async () => {
    const response = await api.get("/debts/names");
    return response.data;
};

export const deleteTransactionApi = async (id: number) => {
    const response = await api.delete(`/debts/transaction/${id}`);
    return response.data;
};
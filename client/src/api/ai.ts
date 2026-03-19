import api from "./axios";

export const analyzeMonthlySummaryApi = async (year: number, month: number) => {
    const response = await api.get("/ai/summary", { params: { year, month } });
    return response.data;
};

export const analyzeStockApi = async () => {
    const response = await api.get("/ai/stock");
    return response.data;
};

export const analyzeDebtApi = async () => {
    const response = await api.get("/ai/debt");
    return response.data;
};
import api from "./axios";

export type UpdateTaxInput = {
    amount?: number;
    paidAmount?: number;
    paidAt?: string | null;
    note?: string | null;
};

export const getTaxesApi = async (year: number, type?: string) => {
    const response = await api.get("/taxes", { params: { year, type }});
    return response.data;
};

export const generateTaxCalendarApi = async (year: number) => {
    const response = await api.post(`/taxes/generate/${year}`);
    return response.data;
};

export const updateTaxApi = async (id: number, data: UpdateTaxInput) => {
    const response =  await api.put(`/taxes/${id}`, data);
    return response.data;
}
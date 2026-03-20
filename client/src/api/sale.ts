import api from "../api/axios";

export type CreateSaleInput = {
    type: "RECEIPT" | "INVOICE";
    paymentType: "CASH" | "CARD" | "MIXED";
    cardAmount: number;
    cashAmount: number;
    note?: string;
    buyerName?: string;
    buyerAddress?: string;
    buyerTaxNo?: string;
    buyerPhone?: string;
    items: {
        productId: number;
        name: string;
        priceType: "PACKAGE" | "PIECE";
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
};

export const createSaleApi = async (data: CreateSaleInput) => {
    const response = await api.post("/sales", data);
    return response.data;
};

export const getSalesApi = async (filters?: { type?: string; page?: number }) => {
    const response = await api.get("/sales", { params: filters });
    return response.data;
};

export const getSaleApi = async (id: number) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
};

export const deleteSaleApi = async (id: number) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
};
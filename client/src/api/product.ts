import api from "./axios";

export type CreateProductInput = {
    name: string;
    description?: string;
    barcode?: string;
    category: string;
    unit: string;
    packageQuantity?: number;
    costPrices: { type: "PACKAGE" | "PIECE"; price: number }[];
    salePrices: { label: string; price: number }[];
    stocks: { type: "PACKAGE" | "PIECE"; quantity: number; minQuantity?: number }[];
};

export const getProductsApi = async (filters?: { category?: string; search?: string }) => {
    const response = await api.get("/products", { params: filters });
    return response.data;
};

export const getProductApi = async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createProductApi = async (data: CreateProductInput) => {
    const response = await api.post("/products", data);
    return response.data;
};

export const updateProductApi = async (id: number, data: Partial<CreateProductInput>) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
};

export const deleteProductApi = async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getPriceHistoryApi = async (id: number) => {
    const response = await api.get(`/products/${id}/price-history`);
    return response.data;
};

export const getCategoriesApi = async () => {
    const response = await api.get("/products/categories");
    return response.data;
};
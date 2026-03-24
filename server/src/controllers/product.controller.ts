import { Request, Response } from "express";
import { CREATED, OK } from "../constants/http";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema";
import {
    getCategoriesService,
    getPriceHistoryService,
    createProductService,
    getProductsService,
    getProductService,
    updateProductService,
    deleteProductService,
    generateBarcodesService,
    clearAllBarcodesService
} from "../services/product.service";


export const createProductHandler = async(req: Request, res: Response) => {
    const body = createProductSchema.parse(req.body);
    const product = await createProductService(body);
    return res.status(CREATED).json({
        message: "Product created successfully.",
        product
    });
};

export const getProductsHandler = async(req: Request, res: Response) => {
    const { category, search } = req.query;
    const products =  await getProductsService({
        category: category as string | undefined,
        search: search as string | undefined
    });
    return res.status(OK).json({
        message: "Products fetched successfully.",
        products
    });
};

export const getProductHandler = async(req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await getProductService(id);
    return res.status(OK).json({
        message: "Product fetched successfully.",
        product
    });
};

export const updateProductHandler = async(req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const body = updateProductSchema.parse(req.body);
    const product =  await updateProductService(id, body);
    return res.status(OK).json({
        message: "Product updated successfully.",
        product
    });
};

export const deleteProductHandler = async(req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    await deleteProductService(id);
    return res.status(OK).json({
        message: "Product deleted successfully."
    });
};

export const getPriceHistoryHandler = async(req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const priceHistory =  await getPriceHistoryService(id);
    return res.status(OK).json({
        message: "Price history fetched successfully.",
        priceHistory
    });
};
export const getCategoriesHandler = async (req: Request, res: Response) => {
    const categories = await getCategoriesService();
    return res.status(OK).json({
        message: "Categories fetched successfully",
        categories
    });
};

export const generateBarcodesHandler = async (req: Request, res: Response) => {
    const result = await generateBarcodesService();
    return res.status(OK).json({ message: `${result.updated} ürüne barkod oluşturuldu`, ...result });
};

export const clearBarcodesHandler =  async (req: Request, res: Response) => {
    await clearAllBarcodesService();
    return res.status(OK).json({ message: `Tüm ürünlerin barkodları silindi.`})
}
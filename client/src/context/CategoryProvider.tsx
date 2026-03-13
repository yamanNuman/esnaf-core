import { useState, useCallback } from "react";
import { CategoryContext } from "./CategoryContext";
import { getCategoriesApi } from "../api/product";

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
    const [categories, setCategories] = useState<string[]>([]);

    const refreshCategories = useCallback(async () => {
        try {
            const data = await getCategoriesApi();
            setCategories(data.categories);
        } catch {
            console.error("Failed to fetch categories");
        }
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, refreshCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};
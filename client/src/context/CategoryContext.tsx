import { createContext } from "react";

type CategoryContextType = {
    categories: string[];
    refreshCategories: () => Promise<void>;
};

export const CategoryContext = createContext<CategoryContextType>({
    categories: [],
    refreshCategories: async () => {}
});
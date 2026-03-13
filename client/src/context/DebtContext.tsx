import { createContext } from "react";

type DebtName = { id: number; name: string };

type DebtContextType = {
    debtNames: DebtName[];
    refreshDebtNames: () => Promise<void>;
};

export const DebtContext = createContext<DebtContextType>({
    debtNames: [],
    refreshDebtNames: async () => {}
});
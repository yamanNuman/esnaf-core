import { useState, useCallback } from "react";
import { DebtContext } from "./DebtContext";
import { getDebtNamesApi } from "../api/debt";

type DebtName = { id: number; name: string };

export const DebtProvider = ({ children }: { children: React.ReactNode }) => {
    const [debtNames, setDebtNames] = useState<DebtName[]>([]);

    const refreshDebtNames = useCallback(async () => {
        try {
            const data = await getDebtNamesApi();
            setDebtNames(data.names);
        } catch {
            console.error("Failed to fetch debt names");
        }
    }, []);

    return (
        <DebtContext.Provider value={{ debtNames, refreshDebtNames }}>
            {children}
        </DebtContext.Provider>
    );
};
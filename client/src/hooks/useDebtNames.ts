import { useContext } from "react";
import { DebtContext } from "../context/DebtContext";

const useDebtNames = () => useContext(DebtContext);

export default useDebtNames;
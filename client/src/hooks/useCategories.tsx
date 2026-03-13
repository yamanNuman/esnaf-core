import { useContext } from "react";
import { CategoryContext } from "../context/CategoryContext";

const useCategories = () => useContext(CategoryContext);

export default useCategories;
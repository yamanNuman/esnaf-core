import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import useDebtNames from "../hooks/useDebtNames";

const Sidebar = () => {
    const location = useLocation();
    const { categories } = useCategories();
    const { debtNames } = useDebtNames();
    const [isProductsOpen, setIsProductsOpen] = useState(location.pathname.startsWith("/dashboard/products"));
    const [isDebtsOpen, setIsDebtsOpen] = useState(location.pathname.startsWith("/dashboard/debts"));

    return (
        <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold">Esnaf Core</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {/* Dashboard */}
                    <li>
                        <Link
                            to="/dashboard"
                            className={`block px-4 py-2 rounded-lg transition ${
                                location.pathname === "/dashboard"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            Dashboard
                        </Link>
                    </li>

                    {/* Products */}
                    <li>
                        <button
                            onClick={() => setIsProductsOpen(!isProductsOpen)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center justify-between ${
                                location.pathname.startsWith("/dashboard/products")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            Products
                            <span>{isProductsOpen ? "▾" : "▸"}</span>
                        </button>

                        {isProductsOpen && (
                            <ul className="mt-1 ml-4 space-y-1">
                                <li>
                                    <Link
                                        to="/dashboard/products"
                                        className={`block px-4 py-2 rounded-lg transition text-sm ${
                                            location.pathname === "/dashboard/products" && !location.search
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-400 hover:bg-gray-700"
                                        }`}
                                    >
                                        All Products
                                    </Link>
                                </li>
                                {categories.map((category) => (
                                    <li key={category}>
                                        <Link
                                            to={`/dashboard/products?category=${encodeURIComponent(category)}`}
                                            className={`block px-4 py-2 rounded-lg transition text-sm ${
                                                location.search === `?category=${encodeURIComponent(category)}`
                                                    ? "bg-blue-500 text-white"
                                                    : "text-gray-400 hover:bg-gray-700"
                                            }`}
                                        >
                                            {category}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Debts */}
                    <li>
                        <button
                            onClick={() => setIsDebtsOpen(!isDebtsOpen)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center justify-between ${
                                location.pathname.startsWith("/dashboard/debts")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            Debts
                            <span>{isDebtsOpen ? "▾" : "▸"}</span>
                        </button>

                        {isDebtsOpen && (
                            <ul className="mt-1 ml-4 space-y-1">
                                <li>
                                    <Link
                                        to="/dashboard/debts"
                                        className={`block px-4 py-2 rounded-lg transition text-sm ${
                                            location.pathname === "/dashboard/debts" && !location.search
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-400 hover:bg-gray-700"
                                        }`}
                                    >
                                        All Debts
                                    </Link>
                                </li>
                                {debtNames.map((debt) => (
                                    <li key={debt.id}>
                                        <Link
                                            to={`/dashboard/debts/${debt.id}`}
                                            className={`block px-4 py-2 rounded-lg transition text-sm ${
                                                location.pathname === `/dashboard/debts/${debt.id}`
                                                    ? "bg-blue-500 text-white"
                                                    : "text-gray-400 hover:bg-gray-700"
                                            }`}
                                        >
                                            {debt.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                                 </li>
                                                   <li>
                                    <Link
                                        to="/dashboard/taxes"
                                        className={`block px-4 py-2 rounded-lg transition ${
                                            location.pathname.startsWith("/dashboard/taxes")
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-300 hover:bg-gray-700"
                                        }`}
                                    >
                                        Taxes
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/accounting"
                                        className={`block px-4 py-2 rounded-lg transition ${
                                            location.pathname.startsWith("/dashboard/accounting")
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-300 hover:bg-gray-700"
                                        }`}
                                    >
                                        Accounting
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/sales"
                                        className={`block px-4 py-2 rounded-lg transition ${
                                            location.pathname.startsWith("/dashboard/sales")
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-300 hover:bg-gray-700"
                                        }`}
                                    >
                                        Sales
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/sales/report"
                                        className={`block px-4 py-2 rounded-lg transition text-sm ${
                                            location.pathname === "/dashboard/sales/report"
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-300 hover:bg-gray-700"
                                        }`}
                                    >
                                        📊 Satış Raporu
                                    </Link>
                                </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
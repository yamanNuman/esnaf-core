import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDebtsApi, deleteDebtApi } from "../api/debt";
import { type Debt, type ApiError } from "../types";
import useAuth from "../hooks/useAuth";
import { analyzeDebtApi } from "../api/ai";

const Debts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<"name" | "totalDebt" | "dueDate" | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fetchDebts = useCallback(async (searchValue?: string) => {
        setIsLoading(true);
        try {
            const data = await getDebtsApi({ search: searchValue || undefined });
            setDebts(data.debts);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch debts");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDebts(search);
    }, [fetchDebts, search]);

    const handleSort = (field: "name" | "totalDebt" | "dueDate") => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const sortedDebts = [...debts].sort((a, b) => {
        if (!sortField) return 0;
        if (sortField === "name") {
            return sortOrder === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortField === "totalDebt") {
            return sortOrder === "asc"
                ? a.totalDebt - b.totalDebt
                : b.totalDebt - a.totalDebt;
        }
        if (sortField === "dueDate") {
            const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
        }
        return 0;
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this debt?")) return;
        try {
            await deleteDebtApi(id);
            setDebts(debts.filter((d) => d.id !== id));
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete debt");
        }
    };

    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        setAiAnalysis(null);
        try {
            const data = await analyzeDebtApi();
            setAiAnalysis(data.analysis);
        } catch {
            setAiAnalysis("Analiz yapılamadı.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Debts</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAiAnalysis}
                        disabled={isAnalyzing}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm disabled:opacity-50"
                    >
                        {isAnalyzing ? "Analiz yapılıyor..." : "🤖 AI Borç Analizi"}
                    </button>
                    {user?.role === "ADMIN" && (
                        <button
                            onClick={() => navigate("/dashboard/debts/create")}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                            + Add Debt
                        </button>
                    )}
                </div>
            </div>

            <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            />

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {!isLoading && debts.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <p className="text-sm text-gray-500 mb-1">Toplam Borç</p>
                    <p className={`text-3xl font-bold ${debts.reduce((acc, d) => acc + d.totalDebt, 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                        {debts.reduce((acc, d) => acc + d.totalDebt, 0).toFixed(2)}₺
                    </p>
                </div>
            )}

            {aiAnalysis && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-700">🤖 AI Borç Analizi</span>
                        <button onClick={() => setAiAnalysis(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕ Kapat</button>
                    </div>
                    {aiAnalysis}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : debts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No debts found.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th
                                    className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort("name")}
                                >
                                    Name {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </th>
                                <th
                                    className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort("totalDebt")}
                                >
                                    Total Debt {sortField === "totalDebt" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </th>
                                <th
                                    className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort("dueDate")}
                                >
                                    Due Date {sortField === "dueDate" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Last Transaction</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Note</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedDebts.map((debt) => (
                                <tr key={debt.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-800">{debt.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className={`font-bold ${debt.totalDebt > 0 ? "text-red-500" : "text-green-500"}`}>
                                            {debt.totalDebt}₺
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {debt.dueDate
                                            ? new Date(debt.dueDate).toLocaleDateString()
                                            : <span className="text-gray-400">-</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {(() => {
                                            const lastPurchase = debt.transactions.find(t => t.type === "PURCHASE");
                                            const lastPayment = debt.transactions.find(t => t.type === "PAYMENT");
                                            return (
                                                <div className="space-y-1">
                                                    {lastPurchase && (
                                                        <div>
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-600">
                                                                Alım
                                                            </span>
                                                            <span className="ml-2 text-gray-500 text-xs">
                                                                {new Date(lastPurchase.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {lastPayment && (
                                                        <div>
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-600">
                                                                Ödeme
                                                            </span>
                                                            <span className="ml-2 text-gray-500 text-xs">
                                                                {new Date(lastPayment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {!lastPurchase && !lastPayment && (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {debt.note || <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/debts/${debt.id}`)}
                                                className="text-blue-500 hover:underline text-sm"
                                            >
                                                View
                                            </button>
                                            {user?.role === "ADMIN" && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/debts/${debt.id}/edit`)}
                                                        className="text-yellow-500 hover:underline text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(debt.id)}
                                                        className="text-red-500 hover:underline text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Debts;
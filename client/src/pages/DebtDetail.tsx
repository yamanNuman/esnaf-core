import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDebtApi, createTransactionApi, deleteTransactionApi } from "../api/debt";
import { type ApiError, type Debt } from "../types";
import useAuth from "../hooks/useAuth";

const DebtDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [debt, setDebt] = useState<Debt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [txSortField, setTxSortField] = useState<"type" | "date" | null>(null);
    const [txSortOrder, setTxSortOrder] = useState<"asc" | "desc">("asc");
    const [date, setDate] = useState("");

    // Transaction modal
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"PURCHASE" | "PAYMENT">("PURCHASE");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTxSort = (field: "type" | "date") => {
    if (txSortField === field) {
        setTxSortOrder(txSortOrder === "asc" ? "desc" : "asc");
    } else {
        setTxSortField(field);
        setTxSortOrder("asc");
    }
    };

    const handleDeleteTransaction = async (txId: number) => {
        if (!confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;
        try {
            await deleteTransactionApi(txId);
            const data = await getDebtApi(Number(id));
            setDebt(data.debt);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "İşlem silinemedi");
        }
    };

    const sortedTransactions = [...(debt?.transactions || [])].sort((a, b) => {
        if (!txSortField) return 0;
        if (txSortField === "type") {
            return txSortOrder === "asc"
                ? a.type.localeCompare(b.type)
                : b.type.localeCompare(a.type);
        }
        if (txSortField === "date") {
            return txSortOrder === "asc"
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
    });

    useEffect(() => {
        const fetchDebt = async () => {
            try {
                const data = await getDebtApi(Number(id));
                setDebt(data.debt);
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || "Failed to fetch debt");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDebt();
    }, [id]);

    const openModal = (type: "PURCHASE" | "PAYMENT") => {
        setModalType(type);
        setAmount("");
        setNote("");
        setDate("");
        setShowModal(true);
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTransactionApi(Number(id), {
                type: modalType,
                amount: Number(amount),
                note: note || undefined,
                date: date ? new Date(date).toISOString() : undefined,
            });
            // Sayfayı yenile
            const data = await getDebtApi(Number(id));
            setDebt(data.debt);
            setShowModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to create transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !debt) {
        return (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error || "Debt not found"}
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{debt.name}</h2>
                    {debt.note && <p className="text-sm text-gray-500">{debt.note}</p>}
                </div>
                <div className="flex gap-2">
                    {user?.role === "ADMIN" && (
                        <button
                            onClick={() => navigate(`/dashboard/debts/${debt.id}/edit`)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/dashboard/debts")}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Total Debt</p>
                        <p className={`text-2xl font-bold ${debt.totalDebt > 0 ? "text-red-500" : "text-green-500"}`}>
                            {debt.totalDebt}₺
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Due Date</p>
                        <p className="text-lg font-medium text-gray-800">
                            {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : "-"}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Total Transactions</p>
                        <p className="text-2xl font-bold text-gray-800">{debt.transactions.length}</p>
                    </div>
                </div>

                {/* Actions */}
                {user?.role === "ADMIN" && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => openModal("PURCHASE")}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                        >
                            + Alım
                        </button>
                        <button
                            onClick={() => openModal("PAYMENT")}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                        >
                            + Ödeme
                        </button>
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700">Transaction History</h3>
                    </div>
                    {debt.transactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No transactions yet.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    ...mevcut th'lar...
                                    {user?.role === "ADMIN" && <th className="px-6 py-3"></th>}
                                </tr>
                                <tr>
                                    <th
                                        className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                        onClick={() => handleTxSort("type")}
                                    >
                                        Type {txSortField === "type" ? (txSortOrder === "asc" ? "↑" : "↓") : "↕"}
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Note</th>
                                    <th
                                        className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                        onClick={() => handleTxSort("date")}
                                    >
                                        Date {txSortField === "date" ? (txSortOrder === "asc" ? "↑" : "↓") : "↕"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sortedTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                t.type === "PURCHASE"
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-600"
                                            }`}>
                                                {t.type === "PURCHASE" ? "Alım" : "Ödeme"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`font-medium ${t.type === "PURCHASE" ? "text-red-500" : "text-green-500"}`}>
                                                {t.type === "PURCHASE" ? "+" : "-"}{t.amount}₺
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {t.note || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {t.date ? new Date(t.date).toLocaleDateString() : new Date(t.createdAt).toLocaleDateString()}
                                        </td>
                                        {user?.role === "ADMIN" && (
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteTransaction(t.id)}
                                                className="text-red-400 hover:text-red-600 text-xs"
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {modalType === "PURCHASE" ? "Alım Ekle" : "Ödeme Ekle"}
                        </h3>
                        <form onSubmit={handleTransaction} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50 ${
                                        modalType === "PURCHASE"
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                >
                                    {isSubmitting ? "..." : modalType === "PURCHASE" ? "Alım Ekle" : "Ödeme Ekle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtDetail;
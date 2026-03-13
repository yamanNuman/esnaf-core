import { useState, useEffect, useCallback } from "react";
import { getMonthlyFixedExpensesApi, updateMonthlyFixedExpenseApi, deleteMonthlyFixedExpenseApi, createMonthlyFixedExpenseApi } from "../api/accounting";
import { type MonthlyFixedExpense, type ApiError } from "../types";

type Props = {
    year: number;
    month: number;
};

const MonthlyFixed = ({ year, month }: Props) => {
    const [expenses, setExpenses] = useState<MonthlyFixedExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<MonthlyFixedExpense | null>(null);
    const [modalData, setModalData] = useState({ description: "", amount: "", dueDate: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMonthlyFixedExpensesApi(year, month);
            setExpenses(data.expenses);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch expenses");
        } finally {
            setIsLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const openCreateModal = () => {
        setEditingExpense(null);
        setModalData({ description: "", amount: "", dueDate: "" });
        setShowModal(true);
    };

    const openEditModal = (expense: MonthlyFixedExpense) => {
        setEditingExpense(expense);
        setModalData({
            description: expense.description,
            amount: expense.amount?.toString() || "",
            dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().split("T")[0] : ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const dueDate = modalData.dueDate
                ? new Date(modalData.dueDate + "T12:00:00Z").toISOString()
                : undefined;

            if (editingExpense) {
                await updateMonthlyFixedExpenseApi(editingExpense.id, {
                    description: modalData.description,
                    amount: modalData.amount ? Number(modalData.amount) : undefined,
                    dueDate
                });
            } else {
                await createMonthlyFixedExpenseApi(year, month, {
                    description: modalData.description,
                    amount: modalData.amount ? Number(modalData.amount) : undefined,
                    dueDate
                });
            }
            await fetchExpenses();
            setShowModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to save expense");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePaid = async (expense: MonthlyFixedExpense) => {
        try {
            await updateMonthlyFixedExpenseApi(expense.id, {
                paidAt: expense.paidAt ? null : new Date().toISOString()
            });
            await fetchExpenses();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update expense");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMonthlyFixedExpenseApi(id);
            await fetchExpenses();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete expense");
        }
    };

    const total = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalPaid = expenses.filter(e => e.paidAt).reduce((acc, e) => acc + (e.amount || 0), 0);
    const paidCount = expenses.filter(e => e.paidAt).length;

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            {/* Özet */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Toplam</p>
                    <p className="text-lg font-bold text-gray-800">{total.toFixed(2)}₺</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Ödenen</p>
                    <p className="text-lg font-bold text-green-500">{totalPaid.toFixed(2)}₺</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Kalan</p>
                    <p className="text-lg font-bold text-red-500">{(total - totalPaid).toFixed(2)}₺</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{paidCount}/{expenses.length} ödendi</p>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                    + Gider Ekle
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {expenses.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">Bu ay banko gider yok.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Açıklama</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutar</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Son Ödeme</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map(expense => (
                                <tr key={expense.id} className={`hover:bg-gray-50 transition ${expense.paidAt ? "opacity-60" : ""}`}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{expense.description}</td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {expense.amount ? `${expense.amount.toFixed(2)}₺` : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString("tr-TR") : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleTogglePaid(expense)}
                                            className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                                                expense.paidAt
                                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                        >
                                            {expense.paidAt ? `✓ Ödendi` : "Ödenmedi"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(expense)}
                                            className="text-blue-400 hover:text-blue-600 text-xs"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="text-red-400 hover:text-red-600 text-xs"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingExpense ? "Gider Düzenle" : "Gider Ekle"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <input
                                    type="text"
                                    value={modalData.description}
                                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                                <input
                                    type="number"
                                    value={modalData.amount}
                                    onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Son Ödeme Tarihi</label>
                                <input
                                    type="date"
                                    value={modalData.dueDate}
                                    onChange={(e) => setModalData({ ...modalData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyFixed;
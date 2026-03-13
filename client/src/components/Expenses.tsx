import { useState, useEffect, useCallback } from "react";
import { getExpensesApi, createExpenseApi, updateExpenseApi, deleteExpenseApi } from "../api/accounting";
import { type Expense, type ApiError } from "../types";

type Props = {
    year: number;
    month: number;
    onUpdate: () => void;
    totalDailyExpenses: number;
};

const Expenses = ({ year, month, onUpdate, totalDailyExpenses }: Props) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [modalData, setModalData] = useState({ date: "", description: "", amount: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getExpensesApi(year, month);
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
        setModalData({
            date: new Date(year, month - 1, new Date().getDate()).toISOString().split("T")[0],
            description: "",
            amount: ""
        });
        setShowModal(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setModalData({
            date: new Date(expense.date).toISOString().split("T")[0],
            description: expense.description,
            amount: expense.amount.toString()
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalData.description || !modalData.amount) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const date = new Date(modalData.date);
            date.setHours(12, 0, 0, 0);

            if (editingExpense) {
                await updateExpenseApi(editingExpense.id, {
                    date: date.toISOString(),
                    description: modalData.description,
                    amount: Number(modalData.amount)
                });
            } else {
                await createExpenseApi({
                    date: date.toISOString(),
                    description: modalData.description,
                    amount: Number(modalData.amount)
                });
            }
            await fetchExpenses();
            onUpdate();
            setShowModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to save expense");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteExpenseApi(id);
            await fetchExpenses();
            onUpdate();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete expense");
        }
    };

    const total = expenses.reduce((acc, e) => acc + e.amount, 0);

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{expenses.length} gider kaydı</p>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                    + Gider Ekle
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {expenses.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">Bu ay gider kaydı yok.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Açıklama</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutar</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(expense.date).toLocaleDateString("tr-TR")}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800">{expense.description}</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-500">
                                        {expense.amount.toFixed(2)}₺
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
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                            <tr className="font-bold text-gray-800">
                                <td className="px-4 py-3" colSpan={2}>TOPLAM</td>
                                <td className="px-4 py-3 text-right text-red-500">{total.toFixed(2)}₺</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Günlük Dükkan Harcamaları */}
            <div className="bg-white rounded-lg shadow-sm mt-4 p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Günlük Dükkan Harcamaları (Toplam)</span>
                <span className="font-bold text-red-500">{totalDailyExpenses.toFixed(2)}₺</span>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                                <input
                                    type="date"
                                    value={modalData.date}
                                    onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <input
                                    type="text"
                                    value={modalData.description}
                                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ne için harcandı?"
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
                                    required
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

export default Expenses;
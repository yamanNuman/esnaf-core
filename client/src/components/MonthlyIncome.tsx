import { useState, useEffect, useCallback } from "react";
import { getMonthlyAdditionalIncomesApi, updateMonthlyAdditionalIncomeApi } from "../api/accounting";
import { type MonthlyAdditionalIncome, type ApiError } from "../types";

type Props = {
    year: number;
    month: number;
    onUpdate: () => void;
};

const MonthlyIncome = ({ year, month, onUpdate }: Props) => {
    const [incomes, setIncomes] = useState<MonthlyAdditionalIncome[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState<MonthlyAdditionalIncome | null>(null);
    const [modalData, setModalData] = useState({ amount: "", spentAmount: "", date: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchIncomes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMonthlyAdditionalIncomesApi(year, month);
            setIncomes(data.incomes);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch incomes");
        } finally {
            setIsLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchIncomes();
    }, [fetchIncomes]);

    const openModal = (income: MonthlyAdditionalIncome) => {
        setEditingIncome(income);
        setModalData({
            amount: income.amount?.toString() || "",
            spentAmount: income.spentAmount?.toString() || "",
            date: income.date ? new Date(income.date).toISOString().split("T")[0] : ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingIncome) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await updateMonthlyAdditionalIncomeApi(editingIncome.id, {
                amount: modalData.amount ? Number(modalData.amount) : undefined,
                spentAmount: modalData.spentAmount ? Number(modalData.spentAmount) : undefined,
                date: modalData.date ? new Date(modalData.date + "T12:00:00Z").toISOString() : undefined
            });
            await fetchIncomes();
            onUpdate();
            setShowModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update income");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalIncome = incomes.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalSpent = incomes.reduce((acc, i) => acc + (i.spentAmount || 0), 0);

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            {/* Özet */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Toplam Ek Gelir</p>
                    <p className="text-lg font-bold text-green-500">{totalIncome.toFixed(2)}₺</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Harcanan</p>
                    <p className="text-lg font-bold text-red-500">{totalSpent.toFixed(2)}₺</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Net Katkı</p>
                    <p className="text-lg font-bold text-blue-500">{(totalIncome - totalSpent).toFixed(2)}₺</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {incomes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">Bu ay ek gelir yok.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Açıklama</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Beklenen Tarih</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutar</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Harcanan</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Net</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {incomes.map(income => (
                                <tr key={income.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-medium text-gray-800">{income.description}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {income.date
                                            ? new Date(income.date).toLocaleDateString("tr-TR")
                                            : <span className="text-gray-400">-</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                                        {income.amount ? `${income.amount.toFixed(2)}₺` : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-500">
                                        {income.spentAmount ? `${income.spentAmount.toFixed(2)}₺` : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-blue-500">
                                        {income.amount
                                            ? `${((income.amount || 0) - (income.spentAmount || 0)).toFixed(2)}₺`
                                            : <span className="text-gray-400">-</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => openModal(income)}
                                            className="text-blue-400 hover:text-blue-600 text-xs"
                                        >
                                            Güncelle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && editingIncome && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingIncome.description}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gelir Tarihi</label>
                                <input
                                    type="date"
                                    value={modalData.date}
                                    onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Harcanan Tutar</label>
                                <input
                                    type="number"
                                    value={modalData.spentAmount}
                                    onChange={(e) => setModalData({ ...modalData, spentAmount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
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

export default MonthlyIncome;
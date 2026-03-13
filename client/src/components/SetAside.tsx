import { useState, useEffect, useCallback } from "react";
import { getSetAsideTransactionsApi, createSetAsideTransactionApi, deleteSetAsideTransactionApi } from "../api/accounting";
import { type SetAsideTransaction, type ApiError } from "../types";

type Props = {
    year: number;
    month: number;
    totalSetAside: number;
    onUpdate: () => void;
};

const SetAside = ({ year, month, totalSetAside, onUpdate }: Props) => {
    const [transactions, setTransactions] = useState<SetAsideTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ description: "", amount: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSetAsideTransactionsApi(year, month);
            setTransactions(data.transactions);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch transactions");
        } finally {
            setIsLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalData.description || !modalData.amount) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await createSetAsideTransactionApi(year, month, {
                description: modalData.description,
                amount: Number(modalData.amount)
            });
            await fetchTransactions();
            onUpdate();
            setShowModal(false);
            setModalData({ description: "", amount: "" });
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to create transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteSetAsideTransactionApi(id);
            await fetchTransactions();
            onUpdate();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete transaction");
        }
    };

    const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
    const remaining = totalSetAside - totalSpent;

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
                    <p className="text-xs text-gray-500 mb-1">Toplam Ayrılan</p>
                    <p className="text-lg font-bold text-blue-500">{totalSetAside.toFixed(2)}₺</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Harcanan</p>
                    <p className="text-lg font-bold text-red-500">{totalSpent.toFixed(2)}₺</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Kalan</p>
                    <p className={`text-lg font-bold ${remaining >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {remaining.toFixed(2)}₺
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{transactions.length} harcama kaydı</p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                    + Harcama Ekle
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">Henüz harcama yok.</div>
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
                            {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-600">
                                        {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800">{t.description}</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-500">
                                        {t.amount.toFixed(2)}₺
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(t.id)}
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
                                <td className="px-4 py-3 text-right text-red-500">{totalSpent.toFixed(2)}₺</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Harcama Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
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

export default SetAside;
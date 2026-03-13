import { useState, useEffect } from "react";
import { getTaxesApi, generateTaxCalendarApi, updateTaxApi } from "../api/tax";
import { type Tax, type ApiError } from "../types";
import useAuth from "../hooks/useAuth";

type TabType = "KDV_DAMGA" | "GECICI_VERGI" | "STOPAJ" | "YILLIK_VERGI";

const TAB_LABELS: Record<TabType, string> = {
    KDV_DAMGA: "KDV & Damga",
    GECICI_VERGI: "Geçici Vergi",
    STOPAJ: "Stopaj",
    YILLIK_VERGI: "Yıllık Vergi"
};

const getStatus = (tax: Tax) => {
    if (tax.paidAt) return "paid";
    const now = new Date();
    const due = new Date(tax.dueDate);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= 7) return "upcoming";
    return "pending";
};

const StatusBadge = ({ tax }: { tax: Tax }) => {
    const status = getStatus(tax);
    const config = {
        paid: { label: "Ödendi", className: "bg-green-100 text-green-600" },
        overdue: { label: "Gecikmiş", className: "bg-red-100 text-red-600" },
        upcoming: { label: "Yaklaşıyor", className: "bg-yellow-100 text-yellow-600" },
        pending: { label: "Bekliyor", className: "bg-gray-100 text-gray-600" }
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config[status].className}`}>
            {config[status].label}
        </span>
    );
};

const Taxes = () => {
    const { user } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState<TabType>("KDV_DAMGA");
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
    const [modalData, setModalData] = useState({ amount: "", paidAmount: "", paidAt: "", note: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTaxes = async (y: number) => {
        setIsLoading(true);
        try {
            const data = await getTaxesApi(y);
            setTaxes(data.taxes);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch taxes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes(year);
    }, [year]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateTaxCalendarApi(year);
            await fetchTaxes(year);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to generate calendar");
        } finally {
            setIsGenerating(false);
        }
    };

    const openModal = (tax: Tax) => {
        setSelectedTax(tax);
        setModalData({
            amount: tax.amount?.toString() || "",
            paidAmount: tax.paidAmount?.toString() || "",
            paidAt: tax.paidAt ? new Date(tax.paidAt).toISOString().split("T")[0] : "",
            note: tax.note || ""
        });
        setShowModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTax) return;
        setIsSubmitting(true);
        try {
            await updateTaxApi(selectedTax.id, {
                amount: modalData.amount ? Number(modalData.amount) : undefined,
                paidAmount: modalData.paidAmount ? Number(modalData.paidAmount) : undefined,
                paidAt: modalData.paidAt ? new Date(modalData.paidAt).toISOString() : null,
                note: modalData.note || null
            });
            await fetchTaxes(year);
            setShowModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update tax");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTaxes = taxes.filter(t => t.type === activeTab);
    const hasCalendar = taxes.length > 0;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Vergi Takvimi</h2>
                <div className="flex items-center gap-3">
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {[2025, 2026, 2027, 2028].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    {user?.role === "ADMIN" && !hasCalendar && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
                        >
                            {isGenerating ? "Oluşturuluyor..." : `${year} Takvimi Oluştur`}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : !hasCalendar ? (
                <div className="text-center py-12 text-gray-500">
                    {year} yılı için vergi takvimi oluşturulmamış.
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {(Object.keys(TAB_LABELS) as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    activeTab === tab
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                }`}
                            >
                                {TAB_LABELS[tab]}
                            </button>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {(Object.keys(TAB_LABELS) as TabType[]).map(tab => {
                            const tabTaxes = taxes.filter(t => t.type === tab);
                            const paid = tabTaxes.filter(t => t.paidAt).length;
                            return (
                                <div key={tab} className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 mb-1">{TAB_LABELS[tab]}</p>
                                    <p className="text-lg font-bold text-gray-800">{paid}/{tabTaxes.length}</p>
                                    <p className="text-xs text-gray-400">ödendi</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Dönem</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Son Ödeme</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tutar</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Ödenen</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Ödeme Tarihi</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Durum</th>
                                    {user?.role === "ADMIN" && (
                                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">İşlem</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTaxes.map((tax) => (
                                    <tr key={tax.id} className={`hover:bg-gray-50 transition ${tax.paidAt ? "opacity-60" : ""}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{tax.period}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(tax.dueDate).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {tax.amount ? `${tax.amount}₺` : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {tax.paidAmount ? `${tax.paidAmount}₺` : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {tax.paidAt ? new Date(tax.paidAt).toLocaleDateString("tr-TR") : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge tax={tax} />
                                        </td>
                                        {user?.role === "ADMIN" && (
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openModal(tax)}
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Güncelle
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Modal */}
            {showModal && selectedTax && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {TAB_LABELS[selectedTax.type as TabType]} - {selectedTax.period}
                        </h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                                <input
                                    type="number"
                                    value={modalData.amount}
                                    onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ödenen Tutar</label>
                                <input
                                    type="number"
                                    value={modalData.paidAmount}
                                    onChange={(e) => setModalData({ ...modalData, paidAmount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
                                <input
                                    type="date"
                                    value={modalData.paidAt}
                                    onChange={(e) => setModalData({ ...modalData, paidAt: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
                                <input
                                    type="text"
                                    value={modalData.note}
                                    onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
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

export default Taxes;
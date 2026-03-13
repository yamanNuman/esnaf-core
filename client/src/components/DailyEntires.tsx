import { useState, useEffect, useCallback } from "react";
import { getDailyEntriesApi, upsertDailyEntryApi, deleteDailyEntryApi } from "../api/accounting";
import { type DailyEntry, type ApiError } from "../types";

type Props = {
    year: number;
    month: number;
    onUpdate: () => void;
};

const DAYS_IN_MONTH = (year: number, month: number) => new Date(year, month, 0).getDate();

const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const DailyEntries = ({ year, month, onUpdate }: Props) => {
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [modalData, setModalData] = useState({
        brokenCash: "",
        expenses: "",
        cardAmount: "",
        cashAmount: "",
        setAside: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDailyEntriesApi(year, month);
            setEntries(data.entries);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch entries");
        } finally {
            setIsLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const getEntry = (day: number) => {
        return entries.find(e => new Date(e.date).getDate() === day);
    };

    const openModal = (day: number) => {
        const date = new Date(year, month - 1, day, 12, 0, 0).toISOString();
        const existing = getEntry(day);
        setSelectedDate(date);
        setModalData({
            brokenCash: existing?.brokenCash.toString() || "",
            expenses: existing?.expenses.toString() || "",
            cardAmount: existing?.cardAmount.toString() || "",
            cashAmount: existing?.cashAmount.toString() || "",
            setAside: existing?.setAside.toString() || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await upsertDailyEntryApi({
                date: selectedDate,
                brokenCash: Number(modalData.brokenCash) || 0,
                expenses: Number(modalData.expenses) || 0,
                cardAmount: Number(modalData.cardAmount) || 0,
                cashAmount: Number(modalData.cashAmount) || 0,
                setAside: Number(modalData.setAside) || 0
            });
            await fetchEntries();
            onUpdate();
            setShowModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to save entry");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteDailyEntryApi(id);
            await fetchEntries();
            onUpdate();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete entry");
        }
    };

    const totalRevenue = entries.reduce((acc, e) => acc + e.brokenCash + e.expenses + e.cardAmount + e.cashAmount + e.setAside, 0);
    const totalSetAside = entries.reduce((acc, e) => acc + e.setAside, 0);
    const totalBrokenCash = entries.reduce((acc, e) => acc + e.brokenCash, 0);
    const totalExpenses = entries.reduce((acc, e) => acc + e.expenses, 0);
    const totalCard = entries.reduce((acc, e) => acc + e.cardAmount, 0);
    const totalCash = entries.reduce((acc, e) => acc + e.cashAmount, 0);
    const totalRemaining = entries.reduce((acc, e) => acc + (e.cardAmount - e.cardAmount * 0.01 + e.cashAmount + e.setAside), 0);

    const days = DAYS_IN_MONTH(year, month);

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Bozuk Para</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Harcamalar</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Kenara Ayrılan</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Kredili Satış</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Nakit Kalan</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Toplam Hasılat</th>
                            <th className="text-right px-4 py-3 text-gray-500 font-medium">Elde Kalan</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                            const entry = getEntry(day);
                            const date = new Date(year, month - 1, day);
                            const dayName = DAY_NAMES[date.getDay()];
                            const totalRevenue = entry ? entry.brokenCash + entry.expenses + entry.cardAmount + entry.cashAmount + entry.setAside : null;
const remaining = entry ? entry.cardAmount - entry.cardAmount * 0.01 + entry.cashAmount + entry.setAside : null;

                            return (
                                <tr
                                    key={day}
                                    className={`hover:bg-gray-50 transition cursor-pointer ${!entry ? "text-gray-300" : "text-gray-700"}`}
                                    onClick={() => openModal(day)}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {day} {["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"][month-1]} {year} {dayName}
                                    </td>
                                    <td className="px-4 py-3 text-right">{entry ? `${entry.brokenCash.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right">{entry ? `${entry.expenses.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right">{entry ? `${entry.setAside.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right">{entry ? `${entry.cardAmount.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right">{entry ? `${entry.cashAmount.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right font-medium">{totalRevenue !== null ? `${totalRevenue.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600">{remaining !== null ? `${remaining.toFixed(2)}₺` : "-"}</td>
                                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                        {entry && (
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-red-400 hover:text-red-600 text-xs"
                                            >
                                                Sil
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {/* Toplam Satırı */}
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr className="font-bold text-gray-800">
                            <td className="px-4 py-3">TOPLAM</td>
                            <td className="px-4 py-3 text-right">{totalBrokenCash.toFixed(2)}₺</td>
                            <td className="px-4 py-3 text-right">{totalExpenses.toFixed(2)}₺</td>
                            <td className="px-4 py-3 text-right">{totalSetAside.toFixed(2)}₺</td>
                            <td className="px-4 py-3 text-right">{totalCard.toFixed(2)}₺</td>
                            <td className="px-4 py-3 text-right">{totalCash.toFixed(2)}₺</td>
                            <td className="px-4 py-3 text-right">{totalRevenue.toFixed(2)}₺</td>
                            <td className="px-4 py-3 text-right text-green-600">{totalRemaining.toFixed(2)}₺</td>
                            <td className="px-4 py-3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {selectedDate && new Date(selectedDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                { label: "Bozuk Para", key: "brokenCash" },
                                { label: "Harcamalar", key: "expenses" },
                                { label: "Kenara Ayrılan", key: "setAside" },
                                { label: "Kredili Satış", key: "cardAmount" },
                                { label: "Nakit Kalan", key: "cashAmount" }
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <input
                                        type="number"
                                        value={modalData[key as keyof typeof modalData]}
                                        onChange={(e) => setModalData({ ...modalData, [key]: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                            {/* Önizleme */}
                            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                <div className="flex justify-between text-gray-600">
                                    <span>Toplam Hasılat:</span>
                                    <span className="font-medium">
                                        {(
                                            (Number(modalData.brokenCash) || 0) +
                                            (Number(modalData.expenses) || 0) +
                                            (Number(modalData.setAside) || 0) +
                                            (Number(modalData.cardAmount) || 0) +
                                            (Number(modalData.cashAmount) || 0)
                                        ).toFixed(2)}₺
                                    </span>
                                </div>
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Elde Kalan:</span>
                                    <span>
                                        {(
                                            (Number(modalData.cardAmount) || 0) -
                                            (Number(modalData.cardAmount) || 0) * 0.01 +
                                            (Number(modalData.cashAmount) || 0) +
                                            (Number(modalData.setAside) || 0)
                                        ).toFixed(2)}₺
                                    </span>
                                </div>
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

export default DailyEntries;
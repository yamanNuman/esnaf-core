import { useState, useEffect, useCallback } from "react";
import { checkMonthExistsApi, generateMonthApi, getMonthlySummaryApi } from "../api/accounting";
import { type MonthlySummary, type ApiError } from "../types";
import useAuth from "../hooks/useAuth";
import DailyEntries from "../components/DailyEntires";
import Expenses from "../components/Expenses";
import MonthlyFixed from "../components/MonthlyFixed";
import MonthlyIncome from "../components/MonthlyIncome";
import AccountingSummary from "../components/AccountingSummary";
import AccountingSettings from "../components/AccountingSettings";
import SetAside from "../components/SetAside";

type TabType = "daily" | "expenses" | "fixed" | "income" | "setAside" |  "summary" | "settings";

const TAB_LABELS: Record<TabType, string> = {
    daily: "Günlük Ciro",
    expenses: "Giderler",
    fixed: "Banko Giderler",
    income: "Ek Gelirler",
    setAside: "Kenara Ayrılan",
    summary: "Özet",
    settings: "Ayarlar"
};

const Accounting = () => {
    const { user } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [activeTab, setActiveTab] = useState<TabType>("daily");
    const [hasMonth, setHasMonth] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    const fetchSummary = useCallback(async () => {
        try {
            const [summaryData, checkData] = await Promise.all([
                getMonthlySummaryApi(year, month),
                checkMonthExistsApi(year, month)
            ]);
            setSummary(summaryData.summary);
            setHasMonth(checkData.exists);
        } catch {
            setHasMonth(false);
            setSummary(null);
        }
    }, [year, month]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            await generateMonthApi(year, month);
            await fetchSummary();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to generate month");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Muhasebe</h2>
                <div className="flex items-center gap-3">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {MONTH_NAMES.map((name, i) => (
                            <option key={i + 1} value={i + 1}>{name}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {[2025, 2026, 2027, 2028].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    {user?.role === "ADMIN" && !hasMonth && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
                        >
                            {isGenerating ? "Oluşturuluyor..." : `${MONTH_NAMES[month - 1]} Oluştur`}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            {!hasMonth ? (
                <div className="text-center py-12 text-gray-500">
                    {MONTH_NAMES[month - 1]} {year} ayı henüz oluşturulmamış.
                </div>
            ) : (
                <>
                    {/* Özet Kartları */}
                    {summary && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">Toplam Hasılat</p>
                                <p className="text-xl font-bold text-gray-800">{summary.totalRevenue.toFixed(2)}₺</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">Dükkan Kalan</p>
                                <p className="text-xl font-bold text-blue-500">
                                    {(summary.shopRemaining + (summary.totalSetAside - summary.totalSetAsideSpent)).toFixed(2)}₺
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">Genel Kalan</p>
                                <p className="text-xl font-bold text-green-500">
                                    {(summary.shopRemaining + (summary.totalSetAside - summary.totalSetAsideSpent) + (summary.totalAdditionalIncome - summary.totalSpentFromIncome)).toFixed(2)}₺
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">Cepte Kalan</p>
                                <p className="text-xl font-bold text-purple-500">{summary.inPocket.toFixed(2)}₺</p>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {(Object.keys(TAB_LABELS) as TabType[])
                            .filter(tab => tab !== "settings" || user?.role === "ADMIN")
                            .map(tab => (
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

                    {/* Tab Content */}
                    {activeTab === "daily" && <DailyEntries year={year} month={month} onUpdate={fetchSummary} />}
                    {activeTab === "expenses" && (
                        <Expenses 
                            year={year} 
                            month={month} 
                            onUpdate={fetchSummary}
                            totalDailyExpenses={summary?.totalDailyExpenses || 0}
                        />
                    )}
                    {activeTab === "fixed" && <MonthlyFixed year={year} month={month} />}
                    {activeTab === "setAside" && (<SetAside year={year} month={month} totalSetAside={summary?.totalSetAside || 0} onUpdate={fetchSummary}/>)}
                    {activeTab === "income" && <MonthlyIncome year={year} month={month} onUpdate={fetchSummary} />}
                    {activeTab === "summary" && <AccountingSummary year={year} month={month} summary={summary} onUpdate={fetchSummary} />}
                    {activeTab === "settings" && <AccountingSettings />}
                </>
            )}
        </div>
    );
};

export default Accounting;
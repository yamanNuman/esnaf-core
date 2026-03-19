import { useState } from "react";
import { upsertMonthlyCarryoverApi } from "../api/accounting";
import { type MonthlySummary, type ApiError } from "../types";
import { analyzeMonthlySummaryApi } from "../api/ai";

type Props = {
    year: number;
    month: number;
    summary: MonthlySummary | null;
    onUpdate: () => void;
};

const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const Row = ({ label, value, color = "text-gray-800", border = false }: {
    label: string;
    value: string;  
    color?: string;
    border?: boolean;
}) => (
    <div className={`flex justify-between items-center py-3 ${border ? "border-t-2 border-gray-300 mt-2" : "border-b border-gray-100"}`}>
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`font-semibold ${color}`}>{value}</span>
    </div>
);

const AccountingSummary = ({ year, month, summary, onUpdate }: Props) => {
    const [carryoverInput, setCarryoverInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleCarryover = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await upsertMonthlyCarryoverApi(year, month, Number(carryoverInput));
            onUpdate();
            setCarryoverInput("");
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to save carryover");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        setAiAnalysis(null);
        try {
            const data = await analyzeMonthlySummaryApi(year, month);
            setAiAnalysis(data.analysis);
        } catch {
            setAiAnalysis("Analiz yapılamadı.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    if (!summary) return (
        <div className="text-center py-12 text-gray-400">Özet yüklenemedi.</div>
    );

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Sol */}
            <div className="space-y-4">
                {/* Dükkan Özeti */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                    🏪 Dükkan Özeti — {MONTH_NAMES[month - 1]} {year}
                </h3>
                <Row label="Toplam Hasılat" value={`${summary.totalRevenue.toFixed(2)}₺`} />
                <Row label="Kart Komisyonu (%1)" value={`- ${summary.totalCardCommission.toFixed(2)}₺`} color="text-red-500" />
                <Row label="Bozuk Para" value={`- ${summary.totalBrokenCash.toFixed(2)}₺`} color="text-red-500" />
                <Row label="Günlük Harcamalar" value={`- ${summary.totalDailyExpenses.toFixed(2)}₺`} color="text-red-500" />
                <Row label="Giderler" value={`- ${summary.totalExpenses.toFixed(2)}₺`} color="text-red-500" />
                <Row label="Kenara Ayrılan Kalan" value={`+ ${(summary.totalSetAside - summary.totalSetAsideSpent).toFixed(2)}₺`} color="text-blue-500" />
                <Row label="Dükkan Kalan" value={`${summary.shopRemaining.toFixed(2)}₺`} />
                <Row label="Dükkan Kalan + Kenara Ayrılan Kalan" value={`${(summary.shopRemaining + ((summary.totalSetAside - summary.totalSetAsideSpent))).toFixed(2)}₺`} />
            </div>

                {/* Kenara Ayrılan */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">🏦 Kenara Ayrılan</h3>
                    <Row label="Toplam Ayrılan" value={`${summary.totalSetAside.toFixed(2)}₺`} />
                    <Row label="Harcanan" value={`- ${summary.totalSetAsideSpent.toFixed(2)}₺`} color="text-red-500" />
                    <Row
                        label="Kalan"
                        value={`${(summary.totalSetAside - summary.totalSetAsideSpent).toFixed(2)}₺`}
                        color="text-blue-500"
                        border
                    />
                </div>

                {/* Genel Özet */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">📊 Genel Özet</h3>
                    <Row label="Dükkan Kalan" value={`${summary.shopRemaining.toFixed(2)}₺`} />
                    <Row label="Ek Gelirler" value={`+ ${summary.totalAdditionalIncome.toFixed(2)}₺`} color="text-green-500" />
                    <Row label="Kenara Ayrılan Kalan" value={`+ ${(summary.totalSetAside - summary.totalSetAsideSpent).toFixed(2)}₺`} color="text-blue-500" />
                    <Row
                        label="Genel Kalan"
                        value={`${summary.generalRemaining.toFixed(2)}₺`}
                        color={summary.generalRemaining >= 0 ? "text-green-600" : "text-red-500"}
                        border
                    />
                </div>
            </div>

            {/* Sağ */}
            <div className="space-y-4">
                {/* Cepte Olan */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">👜 Cepte Olan</h3>
                    <Row label="Toplam Hasılat" value={`${summary.totalRevenue.toFixed(2)}₺`} />
                    <Row label="Kart Komisyonu (%1)" value={`- ${summary.totalCardCommission.toFixed(2)}₺`} color="text-red-500" />
                    <Row label="Bozuk Para" value={`- ${summary.totalBrokenCash.toFixed(2)}₺`} color="text-red-500" />
                    <Row label="Günlük Harcamalar" value={`- ${summary.totalDailyExpenses.toFixed(2)}₺`} color="text-red-500" />
                    <Row label="Giderler" value={`- ${summary.totalExpenses.toFixed(2)}₺`} color="text-red-500" />
                    <Row label="Kenara Ayrılan" value={`- ${summary.totalSetAside.toFixed(2)}₺`} color="text-red-500" />
                    <Row label="Kenara Ayrılandan Harcanan" value={`+ ${summary.totalSetAsideSpent.toFixed(2)}₺`} color="text-orange-500" />
                    <Row label="Önceki Ay Devir" value={`+ ${summary.carryoverAmount.toFixed(2)}₺`} color="text-green-500" />
                    <Row label="Ek Gelirler" value={`+ ${summary.totalAdditionalIncome.toFixed(2)}₺`} color="text-green-500" />
                    <Row label="Ek Gelirden Harcanan" value={`+ ${summary.totalSpentFromIncome.toFixed(2)}₺`} color="text-orange-500" />
                    <Row
                        label="Cepte Olan"
                        value={`${summary.inPocket.toFixed(2)}₺`}
                        color={summary.inPocket >= 0 ? "text-purple-600" : "text-red-500"}
                        border
                    />
                </div>

                {/* Devir Girişi */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">🔄 Önceki Ay Devir</h3>
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                    <form onSubmit={handleCarryover} className="flex gap-3">
                        <input
                            type="number"
                            value={carryoverInput}
                            onChange={(e) => setCarryoverInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={summary.carryoverAmount > 0 ? `Mevcut: ${summary.carryoverAmount.toFixed(2)}₺` : "0.00"}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !carryoverInput}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
                        >
                            {isSubmitting ? "..." : "Kaydet"}
                        </button>
                    </form>
                </div>
                {/* AI Analiz */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-800">🤖 AI Muhasebe Analizi</h3>
                        <button
                            onClick={handleAiAnalysis}
                            disabled={isAnalyzing}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm disabled:opacity-50"
                        >
                            {isAnalyzing ? "Analiz yapılıyor..." : "Analiz Et"}
                        </button>
                    </div>
                    {aiAnalysis && (
                        <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {aiAnalysis}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountingSummary;
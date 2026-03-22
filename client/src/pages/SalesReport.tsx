import { useState, useEffect, useCallback } from "react";
import { getSalesReportApi } from "../api/sale";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import type { ApiError } from "../types";

type Period = "today" | "week" | "month" | "year" | "custom";

type Summary = {
    totalRevenue: number;
    totalSales: number;
    avgSaleAmount: number;
    receiptCount: number;
    invoiceCount: number;
    cashTotal: number;
    cardTotal: number;
};

type ChartData = { label: string; value: number };
type TopProduct = { name: string; quantity: number; revenue: number };

const PERIOD_LABELS: Record<Period, string> = {
    today: "Bugün",
    week: "Bu Hafta",
    month: "Bu Ay",
    year: "Bu Yıl",
    custom: "Özel Aralık",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

const SalesReport = () => {
    const [period, setPeriod] = useState<Period>("month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState<Summary | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState("");

    const fetchReport = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getSalesReportApi({
                period,
                ...(period === "custom" && { startDate, endDate })
            });
            setSummary(data.report.summary);
            setChartData(data.report.chartData);
            setTopProducts(data.report.topProducts);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Rapor getirilemedi");
        } finally {
            setIsLoading(false);
        }
    }, [period, startDate, endDate]);

    useEffect(() => {
        if (period !== "custom") fetchReport();
    }, [period, fetchReport]);

    const pieData = summary ? [
        { name: "Nakit", value: summary.cashTotal },
        { name: "Kart", value: summary.cardTotal },
        { name: "Karma", value: Math.max(0, summary.totalRevenue - summary.cashTotal - summary.cardTotal) },
    ].filter(d => d.value > 0) : [];

    const filteredProducts = topProducts.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Satış Raporu</h2>
            </div>

            {/* Dönem Seçici */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            period === p ? "bg-blue-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {PERIOD_LABELS[p]}
                    </button>
                ))}
            </div>

            {/* Özel Tarih Aralığı */}
            {period === "custom" && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 items-end">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Başlangıç</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Bitiş</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={!startDate || !endDate}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition disabled:opacity-50"
                    >
                        Getir
                    </button>
                </div>
            )}

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : summary && (
                <>
                    {/* Özet Kartlar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <p className="text-xs text-gray-500 mb-1">Toplam Ciro</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.totalRevenue.toFixed(2)}₺</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <p className="text-xs text-gray-500 mb-1">Toplam Satış</p>
                            <p className="text-2xl font-bold text-blue-600">{summary.totalSales}</p>
                            <p className="text-xs text-gray-400 mt-1">{summary.receiptCount} fiş · {summary.invoiceCount} fatura</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <p className="text-xs text-gray-500 mb-1">Ortalama Fiş</p>
                            <p className="text-2xl font-bold text-green-600">{summary.avgSaleAmount.toFixed(2)}₺</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <p className="text-xs text-gray-500 mb-1">Nakit / Kart</p>
                            <p className="text-xl font-bold text-purple-600">{summary.cashTotal.toFixed(0)}₺ / {summary.cardTotal.toFixed(0)}₺</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Ciro Grafiği */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                {period === "today" ? "Saatlik" : period === "year" ? "Aylık" : "Günlük"} Ciro
                            </h3>
                            {chartData.every(d => d.value === 0) ? (
                                <p className="text-sm text-gray-400 text-center py-8">Bu dönemde satış yok</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}₺`} />
                                        <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}₺`, "Ciro"]} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Ödeme Dağılımı */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ödeme Dağılımı</h3>
                            {pieData.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">Veri yok</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={75}
                                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                            fontSize={11}
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip formatter={(v) => `${Number(v).toFixed(2)}₺`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Top 10 Bar Chart */}
                    {topProducts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">En Çok Satan İlk 10 Ürün</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={topProducts.slice(0, 10)}
                                    layout="vertical"
                                    margin={{ top: 0, right: 20, left: 130, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}₺`} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                                    <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}₺`, "Ciro"]} />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Tüm Ürünler Tablosu */}
                    <div className="bg-white rounded-lg shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700">
                                Ürün Satış Detayı
                                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{topProducts.length} ürün</span>
                            </h3>
                        </div>

                        {topProducts.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">Bu dönemde satış yok</p>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    placeholder="Ürün ara..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                />
                                <div className="overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">#</th>
                                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">Ürün</th>
                                                <th className="text-right px-4 py-2 text-gray-500 font-medium text-xs">Satış Adedi</th>
                                                <th className="text-right px-4 py-2 text-gray-500 font-medium text-xs">Ciro</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredProducts.map((p, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                                                    <td className="px-4 py-2 font-medium text-gray-800">{p.name}</td>
                                                    <td className="px-4 py-2 text-right text-gray-600">{p.quantity}</td>
                                                    <td className="px-4 py-2 text-right font-semibold text-green-600">{p.revenue.toFixed(2)}₺</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                            <tr className="font-bold">
                                                <td colSpan={2} className="px-4 py-2 text-gray-700">TOPLAM</td>
                                                <td className="px-4 py-2 text-right text-gray-700">
                                                    {filteredProducts.reduce((acc, p) => acc + p.quantity, 0)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-green-600">
                                                    {filteredProducts.reduce((acc, p) => acc + p.revenue, 0).toFixed(2)}₺
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SalesReport;
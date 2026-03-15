import { useEffect, useState } from "react";
import { getProductsApi } from "../api/product";
import { getDebtsApi, getRecentTransactionsApi } from "../api/debt";
import { getTaxesApi } from "../api/tax";
import { getMonthlyFixedExpensesApi,getMonthlySummaryApi, checkMonthExistsApi } from "../api/accounting";
import type { Product, Debt, Tax, MonthlySummary, MonthlyFixedExpense, DebtTransaction } from "../types";

const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const TAX_LABELS: Record<string, string> = {
    KDV_DAMGA: "KDV & Damga",
    GECICI_VERGI: "Geçici Vergi",
    STOPAJ: "Stopaj",
    YILLIK_VERGI: "Yıllık Vergi",
};

const Dashboard = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [upcomingFixed, setUpcomingFixed] = useState<MonthlyFixedExpense[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<(DebtTransaction & { debt: { name: string } })[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [upcomingTaxes, setUpcomingTaxes] = useState<Tax[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [hasMonth, setHasMonth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [productsData, debtsData, taxesData, checkData, fixedData, recentTxData] = await Promise.all([
                    getProductsApi(),
                    getDebtsApi(),
                    getTaxesApi(currentYear),
                    checkMonthExistsApi(currentYear, currentMonth),
                    getMonthlyFixedExpensesApi(currentYear, currentMonth),
                    getRecentTransactionsApi(),
                ]);
                setProducts(productsData.products);
                setDebts(debtsData.debts);

                // Önümüzdeki 30 gün içindeki ödenmemiş vergiler
                const upcoming = taxesData.taxes.filter((t: Tax) => {
                    if (t.paidAt) return false;
                    const due = new Date(t.dueDate);
                    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 30;
                });
                setUpcomingTaxes(upcoming);
                const upcomingFixedList = fixedData.expenses.filter((f: MonthlyFixedExpense) => {
                    if (f.paidAt || !f.dueDate) return false;
                    const due = new Date(f.dueDate);
                    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= -1 && diff <= 30;
                });
                setUpcomingFixed(upcomingFixedList);
                setRecentTransactions(recentTxData.transactions);
                setHasMonth(checkData.exists);

                if (checkData.exists) {
                    const summaryData = await getMonthlySummaryApi(currentYear, currentMonth);
                    setSummary(summaryData.summary);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const lowStockProducts = products.filter(p =>
        p.stocks.some(s => s.quantity <= s.minQuantity && s.minQuantity > 0)
    );

    const totalDebt = debts.reduce((acc, d) => acc + d.totalDebt, 0);

    if (isLoading) return (
        <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <span className="text-sm text-gray-500">{MONTH_NAMES[currentMonth - 1]} {currentYear}</span>
            </div>

            {/* Özet Kartlar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Toplam Ürün */}
                <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 text-xl">📦</div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Toplam Ürün</p>
                        <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                        {lowStockProducts.length > 0 && (
                            <p className="text-xs text-red-500 mt-0.5">{lowStockProducts.length} düşük stok</p>
                        )}
                    </div>
                </div>

                {/* Bu Ay Hasılat */}
                <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-500 text-xl">📈</div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Bu Ay Hasılat</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {hasMonth && summary ? `${summary.totalRevenue.toFixed(2)}₺` : "—"}
                        </p>
                        {!hasMonth && <p className="text-xs text-gray-400 mt-0.5">Ay oluşturulmamış</p>}
                    </div>
                </div>

                {/* Toplam Borç */}
                <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 text-xl">💸</div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Toplam Borç</p>
                        <p className="text-2xl font-bold text-gray-800">{totalDebt.toFixed(2)}₺</p>
                        <p className="text-xs text-gray-400 mt-0.5">{debts.length} kayıt</p>
                    </div>
                </div>

                {/* Yaklaşan Vergiler */}
                <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 text-xl">🗓️</div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Yaklaşan Vergi</p>
                        <p className="text-2xl font-bold text-gray-800">{upcomingTaxes.length}</p>
                        <p className="text-xs text-gray-400 mt-0.5">30 gün içinde</p>
                    </div>
                </div>
                {/* Yaklaşan Giderler */}
                <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 text-xl">🗓️</div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Yaklaşan Giderler</p>
                        <p className="text-2xl font-bold text-gray-800">{upcomingFixed.length}</p>
                        <p className="text-xs text-gray-400 mt-0.5">30 gün içinde</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bu Ay Özet */}
                {hasMonth && summary && (
            <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">{MONTH_NAMES[currentMonth - 1]} Özeti</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Toplam Hasılat</span>
                        <span className="text-sm font-semibold text-gray-800">{summary.totalRevenue.toFixed(2)}₺</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Dükkan Kalan</span>
                        <span className="text-sm font-semibold text-blue-600">{summary.shopRemaining.toFixed(2)}₺</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Dükkan Kalan + Kenara Ayrılan</span>
                        <span className="text-sm font-semibold text-blue-500">
                            {(summary.shopRemaining + (summary.totalSetAside - summary.totalSetAsideSpent)).toFixed(2)}₺
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Dükkan Kalan + Kenara Ayrılan Kalan + Ek Gelir Kalan</span>
                        <span className="text-sm font-semibold text-blue-500">
                            {(summary.shopRemaining + (summary.totalSetAside - summary.totalSetAsideSpent) + (summary.totalAdditionalIncome - summary.totalSpentFromIncome)).toFixed(2)}₺
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Kenara Ayrılan</span>
                        <span className="text-sm font-semibold text-blue-500">
                            {(summary.totalSetAside).toFixed(2)}₺
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Kenara Ayrılandan Kalan</span>
                        <span className="text-sm font-semibold text-blue-500">
                            {((summary.totalSetAside - summary.totalSetAsideSpent)).toFixed(2)}₺
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Ek Gelir</span>
                        <span className="text-sm font-semibold text-blue-500">
                            {(summary.totalAdditionalIncome).toFixed(2)}₺
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Ek Gelirden Kalan</span>
                        <span className="text-sm font-semibold text-blue-500">
                            {(summary.totalAdditionalIncome - summary.totalSpentFromIncome).toFixed(2)}₺
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                        <span className="text-sm text-gray-500">Cepte Olan</span>
                        <span className="text-sm font-semibold text-purple-600">{summary.inPocket.toFixed(2)}₺</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                        <span className="text-sm text-gray-500">Toplam Gider</span>
                        <span className="text-sm font-semibold text-red-500">-{summary.totalExpenses.toFixed(2)}₺</span>
                    </div>
                </div>
            </div>
        )}

                {/* Düşük Stok */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        Düşük Stok
                        {lowStockProducts.length > 0 && (
                            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{lowStockProducts.length}</span>
                        )}
                    </h3>
                    {lowStockProducts.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">Düşük stoklu ürün yok ✓</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {lowStockProducts.map(p => {
                                const lowStock = p.stocks.find(s => s.quantity <= s.minQuantity && s.minQuantity > 0);
                                return (
                                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-red-500">{lowStock?.quantity} {p.unit}</p>
                                            <p className="text-xs text-gray-400">min: {lowStock?.minQuantity}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Yaklaşan Vergiler */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Yaklaşan Vergiler (30 gün)</h3>
                    {upcomingTaxes.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">30 gün içinde vergi yok ✓</p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingTaxes.map(t => {
                                const due = new Date(t.dueDate);
                                const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={t.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{TAX_LABELS[t.type]}</p>
                                            <p className="text-xs text-gray-400">{due.toLocaleDateString("tr-TR")}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            diff <= 7 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                                        }`}>
                                            {diff === 0 ? "Bugün" : `${diff} gün`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Yaklaşan Banko Giderler */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Yaklaşan Banko Giderler</h3>
                    {upcomingFixed.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">Yaklaşan banko gider yok ✓</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {upcomingFixed.map(f => {
                                const due = new Date(f.dueDate!);
                                const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={f.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{f.description}</p>
                                            <p className="text-xs text-gray-400">{due.toLocaleDateString("tr-TR")}</p>
                                        </div>
                                        <div className="text-right">
                                            {f.amount && (
                                                <p className="text-sm font-semibold text-gray-800">{f.amount.toFixed(2)}₺</p>
                                            )}
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                diff <= 3 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                                            }`}>
                                                {diff <= 0 ? "Bugün/Geçti" : `${diff} gün`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Son Eklenen Ürünler */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Son Eklenen Ürünler</h3>
                    <div className="space-y-2">
                        {[...products]
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 5)
                            .map(p => {
                                const salePrice = p.salePrices[p.salePrices.length - 1];
                                return (
                                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.category}</p>
                                        </div>
                                        <div className="text-right">
                                            {salePrice && (
                                                <p className="text-sm font-semibold text-gray-800">{salePrice.price.toFixed(2)}₺</p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                {/* Son İşlemler */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Son Borç İşlemleri</h3>
                    {recentTransactions.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">Henüz işlem yok</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {recentTransactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{t.debt.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-semibold ${t.type === "PURCHASE" ? "text-red-500" : "text-green-600"}`}>
                                            {t.type === "PURCHASE" ? "+" : "-"}{t.amount.toFixed(2)}₺
                                        </p>
                                        <p className="text-xs text-gray-400">{t.type === "PURCHASE" ? "Alım" : "Ödeme"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

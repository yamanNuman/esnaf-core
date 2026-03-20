/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { getSalesApi, deleteSaleApi, getSaleApi } from "../api/sale";
import type { Sale, ApiError } from "../types";
import useAuth from "../hooks/useAuth";
import api from "../api/axios";
import PrintPreview from "./PrintPreview";

const VAT_RATE = 0.20;

const PAYMENT_LABELS: Record<string, string> = {
    CASH: "Nakit",
    CARD: "Kart",
    MIXED: "Karma",
};

type ShopInfo = {
    name: string;
    address: string;
    phone: string;
    taxNo: string;
};

const SaleHistory = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [shopInfo, setShopInfo] = useState<ShopInfo>({ name: "", address: "", phone: "", taxNo: "" });
    const [printSale, setPrintSale] = useState<any>(null);

    const fetchSales = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSalesApi({ type: filter || undefined, page });
            setSales(data.sales);
            setTotalPages(data.totalPages);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Fişler getirilemedi");
        } finally {
            setIsLoading(false);
        }
    }, [filter, page]);

    useEffect(() => {
        fetchSales();
        api.get("/settings/shop").then(r => setShopInfo(r.data)).catch(() => {});
    }, [fetchSales]);

    const handleDelete = async (id: number) => {
        if (!confirm("Bu fişi silmek istediğinize emin misiniz? Stoklar geri yüklenecek.")) return;
        try {
            await deleteSaleApi(id);
            fetchSales();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Fiş silinemedi");
        }
    };

    const handleViewDetail = async (id: number) => {
        setIsLoadingDetail(true);
        try {
            const data = await getSaleApi(id);
            setSelectedSale(data.sale);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Detay getirilemedi");
        } finally {
            setIsLoadingDetail(false);
        }
    };

    return (
        <div>
            {/* Filtreler */}
            <div className="flex gap-2 mb-4">
                {[
                    { value: "", label: "Tümü" },
                    { value: "RECEIPT", label: "Fişler" },
                    { value: "INVOICE", label: "Faturalar" },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => { setFilter(f.value); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filter === f.value ? "bg-blue-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : sales.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Kayıt bulunamadı</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">No</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tür</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutar</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ödeme</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{sale.receiptNo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            sale.type === "INVOICE" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                        }`}>
                                            {sale.type === "INVOICE" ? "Fatura" : "Fiş"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{new Date(sale.createdAt).toLocaleString("tr-TR")}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{Number(sale.totalAmount).toFixed(2)}₺</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            sale.paymentType === "CASH" ? "bg-green-100 text-green-600" :
                                            sale.paymentType === "CARD" ? "bg-orange-100 text-orange-600" :
                                            "bg-gray-100 text-gray-600"
                                        }`}>
                                            {PAYMENT_LABELS[sale.paymentType]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => handleViewDetail(sale.id)} className="text-blue-500 hover:underline text-xs">Detay</button>
                                            <button onClick={() => setPrintSale(sale)} className="text-gray-500 hover:underline text-xs">🖨️</button>
                                            {user?.role === "ADMIN" && (
                                                <button onClick={() => handleDelete(sale.id)} className="text-red-400 hover:underline text-xs">Sil</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sayfalama */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50">←</button>
                    <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-50">→</button>
                </div>
            )}

            {/* Detay Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs text-gray-400">{selectedSale.receiptNo}</p>
                                <p className="text-xs text-gray-400">{new Date(selectedSale.createdAt).toLocaleString("tr-TR")}</p>
                            </div>
                            <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {/* Dükkan Bilgisi */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                            <p className="font-bold text-gray-800">{shopInfo.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{shopInfo.address}</p>
                            <p className="text-xs text-gray-500">Tel: {shopInfo.phone}</p>
                            {shopInfo.taxNo && <p className="text-xs text-gray-500">VKN: {shopInfo.taxNo}</p>}
                        </div>

                        {/* Alıcı Bilgisi (fatura ise) */}
                        {selectedSale.type === "INVOICE" && selectedSale.buyerName && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                <p className="text-xs font-semibold text-gray-600 mb-1">SAYIN</p>
                                <p className="text-sm font-bold text-gray-800">{selectedSale.buyerName}</p>
                                {selectedSale.buyerAddress && <p className="text-xs text-gray-500">{selectedSale.buyerAddress}</p>}
                                {selectedSale.buyerPhone && <p className="text-xs text-gray-500">Tel: {selectedSale.buyerPhone}</p>}
                                {selectedSale.buyerTaxNo && <p className="text-xs text-gray-500">VKN: {selectedSale.buyerTaxNo}</p>}
                            </div>
                        )}

                        <p className="text-center text-sm font-bold text-gray-800 mb-3">
                            {selectedSale.type === "INVOICE" ? "e-FATURA" : "SATIŞ FİŞİ"}
                        </p>

                        <table className="w-full text-sm mb-4">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Ürün</th>
                                    <th className="text-right px-3 py-2 text-gray-500 font-medium">Miktar</th>
                                    <th className="text-right px-3 py-2 text-gray-500 font-medium">Fiyat</th>
                                    <th className="text-right px-3 py-2 text-gray-500 font-medium">Toplam</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedSale.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-gray-700">{item.name}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{item.quantity} {item.priceType === "PACKAGE" ? "Koli" : "Adet"}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{Number(item.unitPrice).toFixed(2)}₺</td>
                                        <td className="px-3 py-2 text-right font-medium text-gray-800">{Number(item.total).toFixed(2)}₺</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="space-y-1 text-sm border-t border-gray-100 pt-3 mb-3">
                            <div className="flex justify-between text-gray-500">
                                <span>KDV Hariç (%20)</span>
                                <span>{(Number(selectedSale.totalAmount) / (1 + VAT_RATE)).toFixed(2)}₺</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>KDV Tutarı</span>
                                <span>{(Number(selectedSale.totalAmount) - Number(selectedSale.totalAmount) / (1 + VAT_RATE)).toFixed(2)}₺</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-3">
                            <span>TOPLAM</span>
                            <span>{Number(selectedSale.totalAmount).toFixed(2)}₺</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>Ödeme</span>
                            <span>{PAYMENT_LABELS[selectedSale.paymentType]}</span>
                        </div>
                        {selectedSale.paymentType === "MIXED" && (
                            <div className="space-y-1 mt-1">
                                <div className="flex justify-between text-sm text-gray-400"><span>Kart</span><span>{Number(selectedSale.cardAmount).toFixed(2)}₺</span></div>
                                <div className="flex justify-between text-sm text-gray-400"><span>Nakit</span><span>{Number(selectedSale.cashAmount).toFixed(2)}₺</span></div>
                            </div>
                        )}
                        {selectedSale.note && <p className="text-sm text-gray-500 mt-2">Not: {selectedSale.note}</p>}

                        <button
                            onClick={() => setPrintSale(selectedSale)}
                            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                            🖨️ Yazdır / PDF
                        </button>
                    </div>
                </div>
            )}

            {isLoadingDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {printSale && (
                <PrintPreview
                    sale={printSale}
                    shopInfo={shopInfo}
                    onClose={() => setPrintSale(null)}
                />
            )}
        </div>
    );
};

export default SaleHistory;
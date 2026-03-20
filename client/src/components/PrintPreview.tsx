import { useEffect } from "react";
import ReactDOM from "react-dom";

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

type SaleItem = {
    id?: number;
    name: string;
    priceType: "PACKAGE" | "PIECE";
    quantity: number;
    unitPrice: number;
    total: number;
};

type PrintSale = {
    receiptNo: string;
    type: "RECEIPT" | "INVOICE";
    paymentType: "CASH" | "CARD" | "MIXED";
    cardAmount: number;
    cashAmount: number;
    totalAmount: number;
    note?: string;
    createdAt: string;
    items: SaleItem[];
    buyerName?: string;
    buyerAddress?: string;
    buyerTaxNo?: string;
    buyerPhone?: string;
};

type Props = {
    sale: PrintSale;
    shopInfo: ShopInfo;
    onClose: () => void;
};

const PrintPreview = ({ sale, shopInfo, onClose }: Props) => {
    const total = Number(sale.totalAmount);
    const vatEx = total / (1 + VAT_RATE);
    const vat = total - vatEx;
    const isInvoice = sale.type === "INVOICE";

    useEffect(() => {
        return () => {
            const printArea = document.getElementById("print-area");
            if (printArea) printArea.innerHTML = "";
        };
    }, []);

    const handlePrint = () => {
        const printArea = document.getElementById("print-area");
        if (!printArea) return;

        if (isInvoice) {
            // A4 Fatura Formatı
            printArea.innerHTML = `
                <div style="font-family: Arial, sans-serif; font-size: 11px; width: 210mm; margin: 0 auto; padding: 15mm 10mm; box-sizing: border-box;">
                    
                    <!-- Üst Başlık: Satıcı + e-FATURA -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 3px solid #000; padding-bottom: 8px;">
                        <div>
                            <p style="font-size: 13px; font-weight: bold; margin-bottom: 3px;">${shopInfo.name}</p>
                            <p style="margin-bottom: 2px;">${shopInfo.address}</p>
                            <p style="margin-bottom: 2px;">Tel: ${shopInfo.phone}</p>
                            ${shopInfo.taxNo ? `<p style="margin-bottom: 2px;">VKN: ${shopInfo.taxNo}</p>` : ""}
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 20px; font-weight: bold; color: #cc0000;">e-FATURA</p>
                        </div>
                    </div>

                    <!-- Alıcı Bilgisi -->
                    <div style="margin-bottom: 8px; border-bottom: 1px solid #999; padding-bottom: 8px;">
                        <p style="font-weight: bold; margin-bottom: 3px;">SAYIN</p>
                        <p style="font-weight: bold; margin-bottom: 2px;">${sale.buyerName || "-"}</p>
                        <p style="margin-bottom: 2px;">${sale.buyerAddress || ""}</p>
                        <p style="margin-bottom: 2px;">Tel: ${sale.buyerPhone || ""}</p>
                        <p style="margin-bottom: 2px;">VKN: ${sale.buyerTaxNo || ""}</p>
                    </div>

                    <!-- Fatura Bilgileri Tablosu (sağ üst) -->
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
                        <table style="border-collapse: collapse; font-size: 10px;">
                            <tr>
                                <td style="border: 1px solid #999; padding: 3px 8px; font-weight: bold; background: #f0f0f0;">Fatura Tipi:</td>
                                <td style="border: 1px solid #999; padding: 3px 8px; background: #ffff00; font-weight: bold;">SATIŞ</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #999; padding: 3px 8px; font-weight: bold; background: #f0f0f0;">Fatura No:</td>
                                <td style="border: 1px solid #999; padding: 3px 8px;">${sale.receiptNo}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #999; padding: 3px 8px; font-weight: bold; background: #f0f0f0;">Fatura Tarihi:</td>
                                <td style="border: 1px solid #999; padding: 3px 8px;">${new Date(sale.createdAt).toLocaleDateString("tr-TR")}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #999; padding: 3px 8px; font-weight: bold; background: #f0f0f0;">Ödeme:</td>
                                <td style="border: 1px solid #999; padding: 3px 8px;">${PAYMENT_LABELS[sale.paymentType]}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Ürün Tablosu -->
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px;">
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: left;">Sıra No</th>
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: left;">Mal/Hizmet Açıklaması</th>
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: right;">Miktar</th>
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: right;">Birim Fiyat</th>
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: right;">KDV Oranı</th>
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: right;">KDV Tutarı</th>
                                <th style="border: 1px solid #999; padding: 4px 6px; text-align: right;">Mal/Hizmet Tutarı</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.items.map((item, i) => {
                                const itemVatEx = Number(item.total) / (1 + VAT_RATE);
                                const itemVat = Number(item.total) - itemVatEx;
                                return `
                                <tr>
                                    <td style="border: 1px solid #999; padding: 4px 6px; text-align: center;">${i + 1}</td>
                                    <td style="border: 1px solid #999; padding: 4px 6px;">${item.name}</td>
                                    <td style="border: 1px solid #999; padding: 4px 6px; text-align: right;">${item.quantity} ${item.priceType === "PACKAGE" ? "Koli" : "Adet"}</td>
                                    <td style="border: 1px solid #999; padding: 4px 6px; text-align: right;">${Number(item.unitPrice).toFixed(2)} TL</td>
                                    <td style="border: 1px solid #999; padding: 4px 6px; text-align: right;">%20</td>
                                    <td style="border: 1px solid #999; padding: 4px 6px; text-align: right;">${itemVat.toFixed(2)} TL</td>
                                    <td style="border: 1px solid #999; padding: 4px 6px; text-align: right;">${Number(item.total).toFixed(2)} TL</td>
                                </tr>`;
                            }).join("")}
                        </tbody>
                    </table>

                    <!-- Alt Toplam -->
                    <div style="display: flex; justify-content: flex-end;">
                        <table style="border-collapse: collapse; font-size: 10px; min-width: 250px;">
                            <tr>
                                <td style="border: 1px solid #999; padding: 4px 8px; font-weight: bold; background: #f0f0f0;">Mal/Hizmet Toplam Tutarı:</td>
                                <td style="border: 1px solid #999; padding: 4px 8px; text-align: right;">${vatEx.toFixed(2)} TL</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #999; padding: 4px 8px; font-weight: bold; background: #f0f0f0;">Toplam KDV (%20):</td>
                                <td style="border: 1px solid #999; padding: 4px 8px; text-align: right;">${vat.toFixed(2)} TL</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #999; padding: 4px 8px; font-weight: bold; background: #f0f0f0;">Ödenecek Tutar:</td>
                                <td style="border: 1px solid #999; padding: 4px 8px; text-align: right; font-weight: bold;">${total.toFixed(2)} TL</td>
                            </tr>
                        </table>
                    </div>

                    ${sale.note ? `<p style="margin-top: 12px; font-size: 10px;">Not: ${sale.note}</p>` : ""}
                </div>
            `;
        } else {
            // Fiş Formatı (Termal)
            printArea.innerHTML = `
                <div style="font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 16px;">
                <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
                    <div style="text-align: center; margin-bottom: 8px;">
                        <p style="font-size: 14px; font-weight: bold; letter-spacing: 1px;">SATIŞ FİŞİ</p>
                        <p style="font-size: 11px;">${sale.receiptNo}</p>
                        <p style="font-size: 11px;">${new Date(sale.createdAt).toLocaleString("tr-TR")}</p>
                    </div>    
                <div style="text-align: center; margin-bottom: 8px;">
                        <p style="font-size: 16px; font-weight: bold; letter-spacing: 1px; margin-bottom: 4px;">${shopInfo.name}</p>
                        <p style="font-size: 10px; color: #444; margin-bottom: 2px;">${shopInfo.address}</p>
                        <p style="font-size: 10px; color: #444; margin-bottom: 2px;">Tel: ${shopInfo.phone}</p>
                        ${shopInfo.taxNo ? `<p style="font-size: 10px; color: #444;">VKN: ${shopInfo.taxNo}</p>` : ""}
                    </div>
                    
                    <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: left; font-size: 11px; padding: 3px 4px; border-bottom: 1px solid #000;">Ürün</th>
                                <th style="text-align: right; font-size: 11px; padding: 3px 4px; border-bottom: 1px solid #000;">Miktar</th>
                                <th style="text-align: right; font-size: 11px; padding: 3px 4px; border-bottom: 1px solid #000;">Fiyat</th>
                                <th style="text-align: right; font-size: 11px; padding: 3px 4px; border-bottom: 1px solid #000;">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.items.map(i => `
                                <tr>
                                    <td style="font-size: 11px; padding: 3px 4px;">${i.name}</td>
                                    <td style="text-align: right; font-size: 11px; padding: 3px 4px;">${i.quantity} ${i.priceType === "PACKAGE" ? "Koli" : "Adet"}</td>
                                    <td style="text-align: right; font-size: 11px; padding: 3px 4px;">${Number(i.unitPrice).toFixed(2)}₺</td>
                                    <td style="text-align: right; font-size: 11px; padding: 3px 4px;">${Number(i.total).toFixed(2)}₺</td>
                                </tr>
                            `).join("")}
                        </tbody>
                        <tfoot>
                            <tr><td colspan="3" style="text-align: right; font-size: 11px; padding: 3px 4px;">KDV Hariç (%20):</td><td style="text-align: right; font-size: 11px; padding: 3px 4px;">${vatEx.toFixed(2)}₺</td></tr>
                            <tr><td colspan="3" style="text-align: right; font-size: 11px; padding: 3px 4px;">KDV Tutarı:</td><td style="text-align: right; font-size: 11px; padding: 3px 4px;">${vat.toFixed(2)}₺</td></tr>
                            <tr><td colspan="3" style="text-align: right; font-size: 11px; padding: 4px; border-top: 1px solid #000; font-weight: bold;">TOPLAM:</td><td style="text-align: right; font-size: 11px; padding: 4px; border-top: 1px solid #000; font-weight: bold;">${total.toFixed(2)}₺</td></tr>
                            <tr><td colspan="3" style="text-align: right; font-size: 11px; padding: 3px 4px;">Ödeme:</td><td style="text-align: right; font-size: 11px; padding: 3px 4px;">${PAYMENT_LABELS[sale.paymentType]}</td></tr>
                            ${sale.paymentType === "MIXED" ? `
                            <tr><td colspan="3" style="text-align: right; font-size: 11px; padding: 3px 4px;">Kart:</td><td style="text-align: right; font-size: 11px; padding: 3px 4px;">${Number(sale.cardAmount).toFixed(2)}₺</td></tr>
                            <tr><td colspan="3" style="text-align: right; font-size: 11px; padding: 3px 4px;">Nakit:</td><td style="text-align: right; font-size: 11px; padding: 3px 4px;">${Number(sale.cashAmount).toFixed(2)}₺</td></tr>
                            ` : ""}
                        </tfoot>
                    </table>
                    ${sale.note ? `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div><p style="font-size: 11px;">Not: ${sale.note}</p>` : ""}
                    <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
                    <p style="text-align: center; font-size: 10px; margin-top: 8px;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
                    <p style="text-align: center; font-size: 10px; margin-top: 8px;">Malımızdan hayır görünüz.</p>
                </div>
            `;
        }

        window.print();
        printArea.innerHTML = "";
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Başlık */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
                    <div>
                        <p className="text-xs text-gray-400">{sale.receiptNo}</p>
                        <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition">🖨️ Yazdır</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl px-2">✕</button>
                    </div>
                </div>

                {/* Önizleme */}
                <div className="p-4">
                    {/* Dükkan Bilgisi */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                        <p className="font-bold text-gray-800">{shopInfo.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{shopInfo.address}</p>
                        <p className="text-xs text-gray-500">Tel: {shopInfo.phone}</p>
                        {shopInfo.taxNo && <p className="text-xs text-gray-500">VKN: {shopInfo.taxNo}</p>}
                    </div>

                    {/* Fatura ise alıcı bilgisi */}
                    {isInvoice && (sale.buyerName || sale.buyerAddress) && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-xs font-semibold text-gray-600 mb-1">SAYIN</p>
                            {sale.buyerName && <p className="text-sm font-bold text-gray-800">{sale.buyerName}</p>}
                            {sale.buyerAddress && <p className="text-xs text-gray-500">{sale.buyerAddress}</p>}
                            {sale.buyerPhone && <p className="text-xs text-gray-500">Tel: {sale.buyerPhone}</p>}
                            {sale.buyerTaxNo && <p className="text-xs text-gray-500">VKN: {sale.buyerTaxNo}</p>}
                        </div>
                    )}

                    <p className="text-center text-sm font-bold text-gray-800 mb-3">
                        {isInvoice ? "e-FATURA" : "SATIŞ FİŞİ"}
                    </p>

                    {/* Ürünler */}
                    <table className="w-full text-sm mb-3">
                        <thead className="bg-gray-50">
                            <tr>
                                {isInvoice && <th className="text-left px-2 py-1.5 text-gray-500 font-medium text-xs">#</th>}
                                <th className="text-left px-2 py-1.5 text-gray-500 font-medium text-xs">Ürün</th>
                                <th className="text-right px-2 py-1.5 text-gray-500 font-medium text-xs">Miktar</th>
                                <th className="text-right px-2 py-1.5 text-gray-500 font-medium text-xs">Fiyat</th>
                                {isInvoice && <th className="text-right px-2 py-1.5 text-gray-500 font-medium text-xs">KDV</th>}
                                <th className="text-right px-2 py-1.5 text-gray-500 font-medium text-xs">Toplam</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sale.items.map((item, i) => {
                                const itemVat = Number(item.total) - Number(item.total) / (1 + VAT_RATE);
                                return (
                                    <tr key={i}>
                                        {isInvoice && <td className="px-2 py-1.5 text-gray-500 text-xs">{i + 1}</td>}
                                        <td className="px-2 py-1.5 text-gray-700 text-xs">{item.name}</td>
                                        <td className="px-2 py-1.5 text-right text-gray-600 text-xs">{item.quantity} {item.priceType === "PACKAGE" ? "Koli" : "Adet"}</td>
                                        <td className="px-2 py-1.5 text-right text-gray-600 text-xs">{Number(item.unitPrice).toFixed(2)}₺</td>
                                        {isInvoice && <td className="px-2 py-1.5 text-right text-gray-600 text-xs">{itemVat.toFixed(2)}₺</td>}
                                        <td className="px-2 py-1.5 text-right font-medium text-gray-800 text-xs">{Number(item.total).toFixed(2)}₺</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Özet */}
                    <div className="space-y-1 border-t border-gray-100 pt-2">
                        <div className="flex justify-between text-xs text-gray-500"><span>KDV Hariç (%20)</span><span>{vatEx.toFixed(2)}₺</span></div>
                        <div className="flex justify-between text-xs text-gray-500"><span>KDV Tutarı</span><span>{vat.toFixed(2)}₺</span></div>
                        <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2"><span>TOPLAM</span><span>{total.toFixed(2)}₺</span></div>
                        <div className="flex justify-between text-xs text-gray-500"><span>Ödeme</span><span>{PAYMENT_LABELS[sale.paymentType]}</span></div>
                        {sale.paymentType === "MIXED" && (
                            <>
                                <div className="flex justify-between text-xs text-gray-400"><span>Kart</span><span>{Number(sale.cardAmount).toFixed(2)}₺</span></div>
                                <div className="flex justify-between text-xs text-gray-400"><span>Nakit</span><span>{Number(sale.cashAmount).toFixed(2)}₺</span></div>
                            </>
                        )}
                    </div>
                    {sale.note && <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">Not: {sale.note}</p>}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PrintPreview;
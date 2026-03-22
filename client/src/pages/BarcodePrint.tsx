import { useState, useEffect } from "react";
import { getProductsApi } from "../api/product";
import type { Product, ApiError } from "../types";
import JsBarcode from "jsbarcode";

type PrintFormat = "a4" | "thermal";

const BarcodePrint = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [selectedPriceIndex, setSelectedPriceIndex] = useState<Record<number, number>>({});
    const [showPrice, setShowPrice] = useState(true);
    const [printFormat, setPrintFormat] = useState<PrintFormat>("a4");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProductsApi()
            .then(d => setProducts(d.products))
            .catch((err: ApiError) => setError(err.response?.data?.message || "Ürünler getirilemedi"))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (search) {
            getProductsApi({ search }).then(d => setProducts(d.products)).catch(() => {});
        } else {
            getProductsApi().then(d => setProducts(d.products)).catch(() => {});
        }
    }, [search]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
    );

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
            if (!quantities[id]) setQuantities(prev => ({ ...prev, [id]: 1 }));
            if (selectedPriceIndex[id] === undefined) setSelectedPriceIndex(prev => ({ ...prev, [id]: 0 }));
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        const allSelected = filteredProducts.every(p => selected.has(p.id));
        if (allSelected) {
            const newSelected = new Set(selected);
            filteredProducts.forEach(p => newSelected.delete(p.id));
            setSelected(newSelected);
        } else {
            const newSelected = new Set(selected);
            const newQty = { ...quantities };
            const newPriceIdx = { ...selectedPriceIndex };
            filteredProducts.forEach(p => {
                newSelected.add(p.id);
                if (!newQty[p.id]) newQty[p.id] = 1;
                if (newPriceIdx[p.id] === undefined) newPriceIdx[p.id] = 0;
            });
            setSelected(newSelected);
            setQuantities(newQty);
            setSelectedPriceIndex(newPriceIdx);
        }
    };

    const selectedProducts = products.filter(p => selected.has(p.id));
    const totalLabels = selectedProducts.reduce((acc, p) => acc + (quantities[p.id] || 1), 0);

    const generateBarcodeSvg = (barcode: string, width: number, height: number, fontSize: number): string => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        try {
            JsBarcode(svg, barcode, { format: "EAN13", width, height, displayValue: true, fontSize, margin: 2, background: "#ffffff", lineColor: "#000000" });
        } catch {
            try {
                JsBarcode(svg, barcode, { format: "CODE128", width, height, displayValue: true, fontSize, margin: 2 });
            } catch { return ""; }
        }
        return svg.outerHTML;
    };

    const handlePrint = () => {
        const printArea = document.getElementById("print-area");
        if (!printArea || selectedProducts.length === 0) return;

        const isA4 = printFormat === "a4";

        // A4: 48x28mm etiket, 4 kolon, 10 satır
        // Thermal: 40x25mm etiket, tek kolon
        const labelW = isA4 ? 48 : 40; // mm
        const labelH = isA4 ? 28 : 25; // mm
        const barcodeW = isA4 ? 1.5 : 1.2;
        const barcodeH = isA4 ? 28 : 22;
        const fontSize = isA4 ? 9 : 8;
        const nameFontSize = isA4 ? 8 : 7;
        const priceFontSize = isA4 ? 9 : 8;
        const columns = isA4 ? 4 : 1;
        const pageWidth = isA4 ? "210mm" : "58mm";

        const labels = selectedProducts.flatMap(p => {
            if (!p.barcode) return [];
            const qty = quantities[p.id] || 1;
            const priceIdx = selectedPriceIndex[p.id] ?? 0;
            const priceText = showPrice && p.salePrices[priceIdx]
                ? `${p.salePrices[priceIdx].label}: ${Number(p.salePrices[priceIdx].price).toFixed(2)}₺`
                : "";
            const svgHtml = generateBarcodeSvg(p.barcode, barcodeW, barcodeH, fontSize);

            return Array.from({ length: qty }, () => `
                <div style="
                    width: ${labelW}mm;
                    height: ${labelH}mm;
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1mm;
                    box-sizing: border-box;
                    background: white;
                    overflow: hidden;
                    border: 0.3mm solid #ccc;
                    page-break-inside: avoid;
                ">
                    <p style="font-size: ${nameFontSize}px; font-weight: bold; text-align: center; margin: 0 0 1px 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #000;">${p.name}</p>
                    ${svgHtml}
                    ${priceText ? `<p style="font-size: ${priceFontSize}px; font-weight: bold; margin: 1px 0 0 0; color: #000;">${priceText}</p>` : ""}
                </div>
            `);
        });

        printArea.innerHTML = `
            <style>
                @page {
                    margin: ${isA4 ? "5mm" : "0"};
                    size: ${pageWidth} auto;
                }
                body { margin: 0; }
            </style>
            <div style="
                display: grid;
                grid-template-columns: repeat(${columns}, ${labelW}mm);
                gap: ${isA4 ? "2mm" : "0"};
                width: ${isA4 ? `${columns * labelW + (columns - 1) * 2}mm` : `${labelW}mm`};
            ">
                ${labels.join("")}
            </div>
        `;

        window.print();
        printArea.innerHTML = "";
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Barkod Yazdır</h2>
                <div className="flex gap-3 items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} />
                        Fiyat göster
                    </label>
                    <button
                        onClick={handlePrint}
                        disabled={selected.size === 0}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition disabled:opacity-50"
                    >
                        🖨️ Yazdır ({totalLabels} etiket)
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            {/* Format Seçici */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Yazdırma Formatı</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => setPrintFormat("a4")}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition border-2 ${
                            printFormat === "a4" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        📄 A4 Kağıt
                        <p className="text-xs font-normal mt-0.5 opacity-70">48x28mm · 4x10 etiket/sayfa</p>
                    </button>
                    <button
                        onClick={() => setPrintFormat("thermal")}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition border-2 ${
                            printFormat === "thermal" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        🖨️ Termal Yazıcı
                        <p className="text-xs font-normal mt-0.5 opacity-70">40x25mm · 58mm rulo</p>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Sol — Ürün Listesi */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Ürün ara..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={selectAll} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                            {filteredProducts.every(p => selected.has(p.id)) ? "Kaldır" : "Tümünü Seç"}
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[550px] overflow-y-auto">
                            {filteredProducts.map(p => (
                                <div key={p.id} className={`p-2 rounded-lg border transition ${selected.has(p.id) ? "bg-blue-50 border-blue-200" : "border-transparent hover:bg-gray-50"}`}>
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleSelect(p.id)}>
                                        <input
                                            type="checkbox"
                                            checked={selected.has(p.id)}
                                            onChange={() => toggleSelect(p.id)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.barcode || "Barkod yok"}</p>
                                        </div>
                                    </div>

                                    {selected.has(p.id) && (
                                        <div className="mt-2 pl-6 space-y-2" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 w-12">Adet:</span>
                                                <button onClick={() => setQuantities(prev => ({ ...prev, [p.id]: Math.max(1, (prev[p.id] || 1) - 1) }))} className="w-5 h-5 rounded bg-gray-200 text-gray-600 text-xs font-bold">−</button>
                                                <span className="text-xs font-medium w-8 text-center">{quantities[p.id] || 1}</span>
                                                <button onClick={() => setQuantities(prev => ({ ...prev, [p.id]: (prev[p.id] || 1) + 1 }))} className="w-5 h-5 rounded bg-gray-200 text-gray-600 text-xs font-bold">+</button>
                                            </div>
                                            {showPrice && p.salePrices.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-12">Fiyat:</span>
                                                    <select
                                                        value={selectedPriceIndex[p.id] ?? 0}
                                                        onChange={e => setSelectedPriceIndex(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        {p.salePrices.map((sp, i) => (
                                                            <option key={i} value={i}>{sp.label} — {Number(sp.price).toFixed(2)}₺</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sağ — Önizleme */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        Önizleme — {printFormat === "a4" ? "A4 (48x28mm)" : "Termal (40x25mm)"}
                        {selected.size > 0 && (
                            <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{totalLabels} etiket</span>
                        )}
                    </h3>
                    {selected.size === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Soldan ürün seçin</p>
                    ) : (
                        <div className={`max-h-[550px] overflow-y-auto ${printFormat === "a4" ? "flex flex-wrap gap-2" : "flex flex-col gap-2 items-start"}`}>
                            {selectedProducts.map(p => {
                                if (!p.barcode) return (
                                    <div key={p.id} className="text-xs text-red-400 p-2 bg-red-50 rounded">{p.name} — barkod yok</div>
                                );
                                const qty = quantities[p.id] || 1;
                                const priceIdx = selectedPriceIndex[p.id] ?? 0;
                                const priceText = showPrice && p.salePrices[priceIdx]
                                    ? `${p.salePrices[priceIdx].label}: ${Number(p.salePrices[priceIdx].price).toFixed(2)}₺`
                                    : undefined;

                                return Array.from({ length: Math.min(qty, 4) }, (_, i) => (
                                    <PreviewLabel
                                        key={`${p.id}-${i}`}
                                        barcode={p.barcode!}
                                        name={p.name}
                                        price={priceText}
                                        format={printFormat}
                                    />
                                ));
                            })}
                            {totalLabels > selectedProducts.reduce((acc, p) => acc + Math.min(quantities[p.id] || 1, 4), 0) && (
                                <p className="text-xs text-gray-400 w-full text-center pt-2">+ daha fazla etiket yazdırılacak</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PreviewLabel = ({ barcode, name, price, format }: { barcode: string; name: string; price?: string; format: PrintFormat }) => {
    const isA4 = format === "a4";
    const w = isA4 ? 181 : 151; // px (48mm * 3.78 ve 40mm * 3.78)
    const h = isA4 ? 106 : 94;  // px (28mm * 3.78 ve 25mm * 3.78)
    const barcodeW = isA4 ? 1.5 : 1.2;
    const barcodeH = isA4 ? 28 : 22;
    const fontSize = isA4 ? 9 : 8;

    const svgRef = (el: SVGSVGElement | null) => {
        if (el && barcode) {
            try {
                JsBarcode(el, barcode, { format: "EAN13", width: barcodeW, height: barcodeH, displayValue: true, fontSize, margin: 2 });
            } catch {
                try {
                    JsBarcode(el, barcode, { format: "CODE128", width: barcodeW, height: barcodeH, displayValue: true, fontSize, margin: 2 });
                } catch { /* */ }
            }
        }
    };

    return (
        <div style={{ width: `${w}px`, height: `${h}px`, display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3px", border: "1px solid #ccc", borderRadius: "3px", background: "#fff", overflow: "hidden", flexShrink: 0 }}>
            <p style={{ fontSize: "8px", fontWeight: "bold", textAlign: "center", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "1px", color: "#000" }}>{name}</p>
            <svg ref={svgRef}></svg>
            {price && <p style={{ fontSize: "8px", fontWeight: "bold", marginTop: "1px", color: "#000" }}>{price}</p>}
        </div>
    );
};

export default BarcodePrint;
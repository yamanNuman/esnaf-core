/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { getProductsApi } from "../api/product";
import { createSaleApi, type CreateSaleInput } from "../api/sale";
import type { Product, ApiError } from "../types";
import api from "../api/axios";
import PrintPreview from "./PrintPreview";

const VAT_RATE = 0.20;

type CartItem = {
    productId: number;
    name: string;
    priceType: "PACKAGE" | "PIECE";
    quantity: number;
    unitPrice: number;
    total: number;
    unit: string;
    maxStock: number;
};

type SaleType = "RECEIPT" | "INVOICE";
type PaymentType = "CASH" | "CARD" | "MIXED";

type ShopInfo = { name: string; address: string; phone: string; taxNo: string; };
type BuyerInfo = { buyerName: string; buyerAddress: string; buyerTaxNo: string; buyerPhone: string; };

const NewSale = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [barcodeInput, setBarcodeInput] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [saleType, setSaleType] = useState<SaleType>("RECEIPT");
    const [paymentType, setPaymentType] = useState<PaymentType>("CASH");
    const [cardAmount, setCardAmount] = useState("");
    const [cashAmount, setCashAmount] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successSale, setSuccessSale] = useState<any>(null);
    const [showProductList, setShowProductList] = useState(false);
    const [shopInfo, setShopInfo] = useState<ShopInfo>({ name: "", address: "", phone: "", taxNo: "" });
    const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({ buyerName: "", buyerAddress: "", buyerTaxNo: "", buyerPhone: "" });
    const [printSale, setPrintSale] = useState<any>(null);

    // Barkod modal state
    const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
    const [barcodeType, setBarcodeType] = useState<"PACKAGE" | "PIECE">("PIECE");
    const [barcodeQty, setBarcodeQty] = useState("1");
    const [barcodePriceIndex, setBarcodePriceIndex] = useState(0);

    // Manuel modal state
    const [manualProduct, setManualProduct] = useState<Product | null>(null);
    const [manualType, setManualType] = useState<"PACKAGE" | "PIECE">("PIECE");
    const [manualQty, setManualQty] = useState("1");
    const [manualPriceIndex, setManualPriceIndex] = useState(0);

    const barcodeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
        api.get("/settings/shop").then(r => setShopInfo(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        setShowProductList(search.length > 0);
    }, [search]);

    const fetchProducts = async (s?: string) => {
        try {
            const data = await getProductsApi({ search: s });
            setProducts(data.products);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Ürünler getirilemedi");
        }
    };

    const handleBarcodeKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && barcodeInput.trim()) {
            const barcode = barcodeInput.trim();
            try {
                const data = await getProductsApi({ search: barcode });
                const product = data.products.find((p: Product) => p.barcode === barcode);
                if (product) {
                    setBarcodeProduct(product);
                    setBarcodeType("PIECE");
                    setBarcodeQty("1");
                    setBarcodePriceIndex(0);
                    setBarcodeInput("");
                    setError(null);
                } else {
                    setError(`Barkod bulunamadı: ${barcode}`);
                    setBarcodeInput("");
                }
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || "Hata oluştu");
                setBarcodeInput("");
            }
        }
    };

    const addToCartWithQty = (product: Product, priceType: "PACKAGE" | "PIECE", qty: number, unitPrice: number) => {
        const stock = product.stocks.find(s => s.type === priceType);
        if (!stock || Number(stock.quantity) <= 0) { setError(`${product.name} için stok yok`); return; }
        if (qty > Number(stock.quantity)) { setError(`${product.name} için yeterli stok yok. Mevcut: ${stock.quantity}`); return; }

        const existing = cart.findIndex(i => i.productId === product.id && i.priceType === priceType && i.unitPrice === unitPrice);
        if (existing >= 0) {
            const updated = [...cart];
            const newQty = updated[existing].quantity + qty;
            if (newQty > updated[existing].maxStock) { setError(`Maksimum stok aşıldı`); return; }
            updated[existing].quantity = newQty;
            updated[existing].total = newQty * updated[existing].unitPrice;
            setCart(updated);
        } else {
            setCart([...cart, {
                productId: product.id, name: product.name, priceType, quantity: qty,
                unitPrice, total: qty * unitPrice,
                unit: product.unit, maxStock: Number(stock.quantity),
            }]);
        }
        setSearch(""); setShowProductList(false); setError(null);
    };

    const handleBarcodeAdd = () => {
        if (!barcodeProduct) return;
        const qty = Number(barcodeQty);
        if (!qty || qty <= 0) { setError("Geçerli bir miktar girin"); return; }
        const selectedPrice = Number(barcodeProduct.salePrices[barcodePriceIndex]?.price || 0);
        addToCartWithQty(barcodeProduct, barcodeType, qty, selectedPrice);
        setBarcodeProduct(null);
        barcodeRef.current?.focus();
    };

    const handleManualAdd = () => {
        if (!manualProduct) return;
        const qty = Number(manualQty);
        if (!qty || qty <= 0) { setError("Geçerli bir miktar girin"); return; }
        const selectedPrice = Number(manualProduct.salePrices[manualPriceIndex]?.price || 0);
        addToCartWithQty(manualProduct, manualType, qty, selectedPrice);
        setManualProduct(null);
    };

    const updateQuantity = (index: number, qty: number) => {
        if (qty <= 0) { removeFromCart(index); return; }
        const updated = [...cart];
        if (qty > updated[index].maxStock) { setError(`Maksimum stok: ${updated[index].maxStock}`); return; }
        updated[index].quantity = qty;
        updated[index].total = qty * updated[index].unitPrice;
        setCart(updated);
        setError(null);
    };

    const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index));

    const totalAmount = cart.reduce((acc, i) => acc + i.total, 0);
    const vatExcluded = totalAmount / (1 + VAT_RATE);
    const vatAmount = totalAmount - vatExcluded;

    const handleSubmit = async () => {
        if (cart.length === 0) { setError("Sepet boş"); return; }
        if (paymentType === "MIXED") {
            const card = Number(cardAmount) || 0;
            const cash = Number(cashAmount) || 0;
            if (Math.abs(card + cash - totalAmount) > 0.01) {
                setError(`Kart + Nakit toplamı (${(card + cash).toFixed(2)}₺) toplam tutara (${totalAmount.toFixed(2)}₺) eşit olmalı`);
                return;
            }
        }
        setIsSubmitting(true); setError(null);
        try {
            const payload: CreateSaleInput = {
                type: saleType, paymentType,
                cardAmount: paymentType === "CARD" ? totalAmount : paymentType === "MIXED" ? Number(cardAmount) : 0,
                cashAmount: paymentType === "CASH" ? totalAmount : paymentType === "MIXED" ? Number(cashAmount) : 0,
                note: note || undefined,
                ...(saleType === "INVOICE" && {
                    buyerName: buyerInfo.buyerName || undefined,
                    buyerAddress: buyerInfo.buyerAddress || undefined,
                    buyerTaxNo: buyerInfo.buyerTaxNo || undefined,
                    buyerPhone: buyerInfo.buyerPhone || undefined,
                }),
                items: cart.map(i => ({
                    productId: i.productId, name: i.name, priceType: i.priceType,
                    quantity: i.quantity, unitPrice: i.unitPrice, total: i.total,
                })),
            };
            const data = await createSaleApi(payload);
            setSuccessSale(data.sale);
            setCart([]); setNote(""); setCardAmount(""); setCashAmount("");
            setBuyerInfo({ buyerName: "", buyerAddress: "", buyerTaxNo: "", buyerPhone: "" });
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Fiş oluşturulamadı");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successSale) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-4">
                    <div className="text-4xl mb-2">✅</div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">{successSale.type === "INVOICE" ? "Fatura" : "Fiş"} Oluşturuldu</h3>
                    <p className="text-green-600 font-mono">{successSale.receiptNo}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{Number(successSale.totalAmount).toFixed(2)}₺</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setPrintSale(successSale)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm">🖨️ Yazdır / PDF</button>
                    <button onClick={() => setSuccessSale(null)} className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm">Yeni Satış</button>
                </div>
                {printSale && <PrintPreview sale={printSale} shopInfo={shopInfo} onClose={() => setPrintSale(null)} />}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
                {/* Barkod */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Barkod ile Ekle</h3>
                    <input ref={barcodeRef} type="text" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyUp={handleBarcodeKeyDown} placeholder="Barkod okut veya yaz → Enter" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" autoFocus />
                </div>

                {/* Manuel Arama */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">📦 Manuel Ürün Ekle</h3>
                    <div className="relative">
                        <input type="text" value={search} onChange={e => { setSearch(e.target.value); fetchProducts(e.target.value); }} placeholder="Ürün adı veya barkod ile ara..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        {showProductList && products.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                {products.slice(0, 10).map(p => (
                                    <div key={p.id} className="p-3 border-b border-gray-50 last:border-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.category}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setManualProduct(p);
                                                setManualType("PIECE");
                                                setManualQty("1");
                                                setManualPriceIndex(0);
                                                setShowProductList(false);
                                                setSearch("");
                                            }}
                                            className="w-full text-xs py-1 px-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                        >
                                            + Ekle
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Belge Tipi */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Belge Tipi</h3>
                    <div className="flex gap-2">
                        {(["RECEIPT", "INVOICE"] as SaleType[]).map(t => (
                            <button key={t} onClick={() => setSaleType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${saleType === t ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                {t === "RECEIPT" ? "🧾 Fiş" : "📄 Fatura"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Alıcı Bilgileri */}
                {saleType === "INVOICE" && (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Alıcı Bilgileri</h3>
                        <div className="space-y-2">
                            {[
                                { label: "Ad / Unvan", key: "buyerName", placeholder: "A Firması" },
                                { label: "Adres", key: "buyerAddress", placeholder: "Mahalle, İlçe, İl" },
                                { label: "VKN / TC", key: "buyerTaxNo", placeholder: "1234567890" },
                                { label: "Telefon", key: "buyerPhone", placeholder: "05xx xxx xx xx" },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                    <input type="text" value={buyerInfo[key as keyof BuyerInfo]} onChange={e => setBuyerInfo({ ...buyerInfo, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ödeme */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Ödeme Yöntemi</h3>
                    <div className="flex gap-2 mb-3">
                        {(["CASH", "CARD", "MIXED"] as PaymentType[]).map(t => (
                            <button key={t} onClick={() => setPaymentType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${paymentType === t ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                {t === "CASH" ? "💵 Nakit" : t === "CARD" ? "💳 Kart" : "🔀 Karma"}
                            </button>
                        ))}
                    </div>
                    {paymentType === "MIXED" && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Kart</label>
                                <input type="number" value={cardAmount} onChange={e => setCardAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Nakit</label>
                                <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Not */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Not (opsiyonel)</label>
                    <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Not ekle..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {/* Sağ — Sepet */}
            <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        🛒 Sepet
                        {cart.length > 0 && <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{cart.length}</span>}
                    </h3>
                    {cart.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Sepet boş</p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {cart.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.priceType === "PACKAGE" ? "Koli" : "Adet"} — {item.unitPrice.toFixed(2)}₺</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold">−</button>
                                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold">+</button>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 w-16 text-right">{item.total.toFixed(2)}₺</p>
                                    <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500"><span>KDV Hariç (%20)</span><span>{vatExcluded.toFixed(2)}₺</span></div>
                        <div className="flex justify-between text-sm text-gray-500"><span>KDV Tutarı</span><span>{vatAmount.toFixed(2)}₺</span></div>
                        <div className="border-t border-gray-100 pt-2"></div>
                        <div className="flex justify-between text-lg font-bold text-gray-800"><span>TOPLAM</span><span>{totalAmount.toFixed(2)}₺</span></div>
                    </div>
                )}

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

                <button onClick={handleSubmit} disabled={isSubmitting || cart.length === 0} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? "İşleniyor..." : `${saleType === "INVOICE" ? "Fatura" : "Fiş"} Oluştur — ${totalAmount.toFixed(2)}₺`}
                </button>
            </div>

            {/* Barkod Modal */}
            {barcodeProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">{barcodeProduct.name}</h3>
                        <p className="text-xs text-gray-400 mb-4">{barcodeProduct.category}</p>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Tür</label>
                            <div className="flex gap-2">
                                {(["PIECE", "PACKAGE"] as const).map(t => {
                                    const stock = barcodeProduct.stocks.find(s => s.type === t);
                                    if (!stock) return null;
                                    return (
                                        <button key={t} onClick={() => setBarcodeType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${barcodeType === t ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                            {t === "PACKAGE" ? "Koli" : "Adet"}<span className="text-xs ml-1 opacity-70">({stock.quantity})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Fiyat</label>
                            <select value={barcodePriceIndex} onChange={e => setBarcodePriceIndex(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {barcodeProduct.salePrices.map((sp, i) => (
                                    <option key={i} value={i}>{sp.label} — {sp.price}₺</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Miktar</label>
                            <input type="number" value={barcodeQty} onChange={e => setBarcodeQty(e.target.value)} min="1" autoFocus onKeyDown={e => e.key === "Enter" && handleBarcodeAdd()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                            <div className="flex justify-between text-gray-600"><span>Birim Fiyat:</span><span>{Number(barcodeProduct.salePrices[barcodePriceIndex]?.price || 0).toFixed(2)}₺</span></div>
                            <div className="flex justify-between font-semibold text-gray-800 mt-1"><span>Toplam:</span><span>{(Number(barcodeProduct.salePrices[barcodePriceIndex]?.price || 0) * (Number(barcodeQty) || 0)).toFixed(2)}₺</span></div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setBarcodeProduct(null); barcodeRef.current?.focus(); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">İptal</button>
                            <button onClick={handleBarcodeAdd} className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Sepete Ekle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manuel Modal */}
            {manualProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">{manualProduct.name}</h3>
                        <p className="text-xs text-gray-400 mb-4">{manualProduct.category}</p>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Tür</label>
                            <div className="flex gap-2">
                                {(["PIECE", "PACKAGE"] as const).map(t => {
                                    const stock = manualProduct.stocks.find(s => s.type === t);
                                    if (!stock) return null;
                                    return (
                                        <button key={t} onClick={() => setManualType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${manualType === t ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                            {t === "PACKAGE" ? "Koli" : "Adet"}<span className="text-xs ml-1 opacity-70">({stock.quantity})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Fiyat</label>
                            <select value={manualPriceIndex} onChange={e => setManualPriceIndex(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {manualProduct.salePrices.map((sp, i) => (
                                    <option key={i} value={i}>{sp.label} — {sp.price}₺</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Miktar</label>
                            <input type="number" value={manualQty} onChange={e => setManualQty(e.target.value)} min="1" autoFocus onKeyDown={e => e.key === "Enter" && handleManualAdd()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                            <div className="flex justify-between text-gray-600"><span>Birim Fiyat:</span><span>{Number(manualProduct.salePrices[manualPriceIndex]?.price || 0).toFixed(2)}₺</span></div>
                            <div className="flex justify-between font-semibold text-gray-800 mt-1"><span>Toplam:</span><span>{(Number(manualProduct.salePrices[manualPriceIndex]?.price || 0) * (Number(manualQty) || 0)).toFixed(2)}₺</span></div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setManualProduct(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">İptal</button>
                            <button onClick={handleManualAdd} className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Sepete Ekle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Preview */}
            {printSale && <PrintPreview sale={printSale} shopInfo={shopInfo} onClose={() => setPrintSale(null)} />}
        </div>
    );
};

export default NewSale;
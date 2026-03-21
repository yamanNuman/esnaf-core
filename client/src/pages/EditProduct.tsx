import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductApi, updateProductApi } from "../api/product";
import { type ApiError, type Product } from "../types";

type CostPrice = { type: "PACKAGE" | "PIECE"; price: number };
type SalePrice = { label: string; price: number };
type Stock = { type: "PACKAGE" | "PIECE"; quantity: number; minQuantity: number };

const EditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        barcode: "",
        category: "",
        unit: "",
        packageQuantity: "",
    });

    const [costPrices, setCostPrices] = useState<CostPrice[]>([]);
    const [salePrices, setSalePrices] = useState<SalePrice[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductApi(Number(id));
                const product: Product = data.product;

                setFormData({
                    name: product.name,
                    description: product.description || "",
                    barcode: product.barcode || "",
                    category: product.category,
                    unit: product.unit,
                    packageQuantity: "",
                });

                setCostPrices(
                    product.costPrices.map(cp => ({
                        type: cp.type,
                        price: cp.price
                    }))
                );

                const latestSalePrices = product.salePrices.reduce((acc: SalePrice[], sp) => {
                    if (!acc.find(p => p.label === sp.label)) {
                        acc.push({ label: sp.label, price: sp.price });
                    }
                    return acc;
                }, []);
                setSalePrices(latestSalePrices);

                setStocks(product.stocks.map(s => ({
                    type: s.type,
                    quantity: s.quantity,
                    minQuantity: s.minQuantity
                })));
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || "Failed to fetch product");
            } finally {
                setIsFetching(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCostPriceChange = (index: number, value: number) => {
        const updated = [...costPrices];
        updated[index].price = value;
        setCostPrices(updated);
    };

    const handleSalePriceChange = (index: number, field: "label" | "price", value: string | number) => {
        const updated = [...salePrices];
        updated[index] = { ...updated[index], [field]: value };
        setSalePrices(updated);
    };

    const handleStockChange = (index: number, field: "quantity" | "minQuantity", value: number) => {
        const updated = [...stocks];
        updated[index] = { ...updated[index], [field]: value };
        setStocks(updated);
    };

    const addSalePrice = () => {
        setSalePrices([...salePrices, { label: "", price: 0 }]);
    };

    const removeSalePrice = (index: number) => {
        setSalePrices(salePrices.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await updateProductApi(Number(id), {
                ...formData,
                description: formData.description || undefined,
                barcode: formData.barcode || undefined,
                packageQuantity: formData.packageQuantity ? Number(formData.packageQuantity) : undefined,
                costPrices,
                salePrices,
                stocks: stocks.filter(s => s.quantity > 0 || s.minQuantity > 0)
            });
            navigate("/dashboard/products");
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update product");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                <button
                    onClick={() => navigate("/dashboard/products")}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    ← Back
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700">Basic Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Cost Prices */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700">Cost Prices</h3>
                    {(["PACKAGE", "PIECE"] as const).map((type) => {
                        const existing = costPrices.find(cp => cp.type === type);
                        return (
                            <div key={type} className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={!!existing}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setCostPrices([...costPrices, { type, price: 0 }]);
                                        } else {
                                            setCostPrices(costPrices.filter(cp => cp.type !== type));
                                        }
                                    }}
                                />
                                <span className="text-sm text-gray-600 w-20">
                                    {type === "PACKAGE" ? "Package" : "Piece"}
                                </span>
                                {existing && (
                                    <>
                                        <input
                                            type="number"
                                            value={existing.price}
                                            onChange={(e) => handleCostPriceChange(
                                                costPrices.findIndex(cp => cp.type === type),
                                                Number(e.target.value)
                                            )}
                                            className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-500">₺</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Sale Prices */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700">Sale Prices</h3>
                        <button
                            type="button"
                            onClick={addSalePrice}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                            + Add
                        </button>
                    </div>
                    {salePrices.map((sp, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Label"
                                value={sp.label}
                                onChange={(e) => handleSalePriceChange(index, "label", e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                value={sp.price}
                                onChange={(e) => handleSalePriceChange(index, "price", Number(e.target.value))}
                                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">₺</span>
                            {salePrices.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSalePrice(index)}
                                    className="text-red-500 hover:text-red-600 text-sm"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Stocks */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700">Stock</h3>
                    {stocks.map((s, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 w-20">
                                {s.type === "PACKAGE" ? "Package" : "Piece"}
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Qty</label>
                                <input
                                    type="number"
                                    value={s.quantity}
                                    onChange={(e) => handleStockChange(index, "quantity", Number(e.target.value))}
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Min</label>
                                <input
                                    type="number"
                                    value={s.minQuantity}
                                    onChange={(e) => handleStockChange(index, "minQuantity", Number(e.target.value))}
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600 w-40">1 Koli = kaç Adet</span>
                        <input
                            type="number"
                            name="packageQuantity"
                            value={formData.packageQuantity}
                            onChange={handleChange}
                            placeholder="Örn: 12"
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-400">Adet stoğu bitince otomatik koliden açılır</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Updating..." : "Update Product"}
                </button>
            </form>
        </div>
    );
};

export default EditProduct;
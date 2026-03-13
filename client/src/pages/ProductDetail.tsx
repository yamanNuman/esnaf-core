import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductApi, getPriceHistoryApi } from "../api/product";
import { type ApiError, type Product, type PriceHistory } from "../types";
import useAuth from "../hooks/useAuth";

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductApi(Number(id));
                setProduct(data.product);
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || "Failed to fetch product");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleShowHistory = async () => {
        if (priceHistory) {
            setShowHistory(!showHistory);
            return;
        }
        try {
            const data = await getPriceHistoryApi(Number(id));
            setPriceHistory(data.priceHistory);
            setShowHistory(true);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch price history");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error || "Product not found"}
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                    {product.barcode && (
                        <p className="text-sm text-gray-400">{product.barcode}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {user?.role === "ADMIN" && (
                        <button
                            onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/dashboard/products")}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Basic Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Category</p>
                            <p className="font-medium text-gray-800">{product.category}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Unit</p>
                            <p className="font-medium text-gray-800">{product.unit}</p>
                        </div>
                        {product.description && (
                            <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Description</p>
                                <p className="font-medium text-gray-800">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cost Prices */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Cost Prices</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {product.costPrices.map((cp) => (
                            <div key={cp.id} className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                    {cp.type === "PACKAGE" ? "Package" : "Piece"}
                                </p>
                                <p className="text-xl font-bold text-gray-800">{cp.price}₺</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(cp.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sale Prices */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Sale Prices</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {product.salePrices.map((sp) => (
                            <div key={sp.id} className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">{sp.label}</p>
                                <p className="text-xl font-bold text-gray-800">{sp.price}₺</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(sp.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stock */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Stock</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {product.stocks.map((s) => (
                            <div key={s.id} className={`p-4 rounded-lg ${s.quantity <= s.minQuantity ? "bg-red-50" : "bg-gray-50"}`}>
                                <p className="text-xs text-gray-500 mb-1">
                                    {s.type === "PACKAGE" ? "Package" : "Piece"}
                                </p>
                                <p className={`text-xl font-bold ${s.quantity <= s.minQuantity ? "text-red-500" : "text-gray-800"}`}>
                                    {s.quantity}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Min: {s.minQuantity}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price History */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Price History</h3>
                        <button
                            onClick={handleShowHistory}
                            className="text-blue-500 hover:underline text-sm"
                        >
                            {showHistory ? "Hide" : "Show"}
                        </button>
                    </div>

                    {showHistory && priceHistory && (
                        <div className="space-y-6">
                            {/* Cost Price History */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-3">Cost Price History</h4>
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-xs text-gray-500">Type</th>
                                            <th className="text-left px-4 py-2 text-xs text-gray-500">Price</th>
                                            <th className="text-left px-4 py-2 text-xs text-gray-500">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {priceHistory.costPriceHistory.map((cp) => (
                                            <tr key={cp.id}>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {cp.type === "PACKAGE" ? "Package" : "Piece"}
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-800">{cp.price}₺</td>
                                                <td className="px-4 py-2 text-sm text-gray-400">
                                                    {new Date(cp.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Sale Price History */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-3">Sale Price History</h4>
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-xs text-gray-500">Label</th>
                                            <th className="text-left px-4 py-2 text-xs text-gray-500">Price</th>
                                            <th className="text-left px-4 py-2 text-xs text-gray-500">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {priceHistory.salePriceHistory.map((sp) => (
                                            <tr key={sp.id}>
                                                <td className="px-4 py-2 text-sm text-gray-600">{sp.label}</td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-800">{sp.price}₺</td>
                                                <td className="px-4 py-2 text-sm text-gray-400">
                                                    {new Date(sp.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
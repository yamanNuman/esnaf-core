import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProductsApi, deleteProductApi } from "../api/product";
import { type Product, type ApiError } from "../types";
import useAuth from "../hooks/useAuth";
import useCategories from "../hooks/useCategories";
import { analyzeStockApi } from "../api/ai";

const Products = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { refreshCategories} = useCategories();
    const [sortField, setSortField] = useState<"name" | "category" | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);  

    const handleSort = (field: "name" | "category") => {
    if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
        setSortField(field);
        setSortOrder("asc");
    }
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (!sortField) return 0;
        return sortOrder === "asc"
            ? a[sortField].localeCompare(b[sortField])
            : b[sortField].localeCompare(a[sortField]);
    });

    const fetchProducts = useCallback(async (searchValue?: string, categoryValue?: string) => {
        setIsLoading(true);
        try {
            const data = await getProductsApi({
                search: searchValue || undefined,
                category: categoryValue || undefined
            });
            setProducts(data.products);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch products");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const categoryParam = searchParams.get("category");
        setCategory(categoryParam || "");
        fetchProducts(undefined, categoryParam || undefined);
    }, [fetchProducts, searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts(search, category);
    };

const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        await deleteProductApi(id);
        setProducts(products.filter((p) => p.id !== id));
        await refreshCategories(); // ← ekle
    } catch (err) {
        const error = err as ApiError;
        setError(error.response?.data?.message || "Failed to delete product");
    }
};

const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
        const data = await analyzeStockApi();
        setAiAnalysis(data.analysis);
    } catch {
        setAiAnalysis("Analiz yapılamadı.");
    } finally {
        setIsAnalyzing(false);
    }
};

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {category ? category : "All Products"}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAiAnalysis}
                        disabled={isAnalyzing}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm disabled:opacity-50"
                    >
                        {isAnalyzing ? "Analiz yapılıyor..." : "🤖 AI Stok Analizi"}
                    </button>
                    {user?.role === "ADMIN" && (
                        <button
                            onClick={() => navigate("/dashboard/products/create")}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                            + Add Product
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Filter */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by name or barcode..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        fetchProducts(e.target.value, category);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Filter by category..."
                    value={category}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        fetchProducts(e.target.value, category);
                    }}
                    className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                    Search
                </button>
            </form>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {aiAnalysis && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-700">🤖 AI Stok Analizi</span>
                        <button onClick={() => setAiAnalysis(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕ Kapat</button>
                    </div>
                    {aiAnalysis}
                </div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No products found.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th
                                    className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort("name")}
                                >
                                    Name {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </th>
                                <th
                                    className="text-left px-6 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort("category")}
                                >
                                    Category {sortField === "category" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Unit</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cost Price</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Sale Prices</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        {product.barcode && (
                                            <p className="text-xs text-gray-400">{product.barcode}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {product.costPrices.map((cp) => (
                                            <p key={cp.id}>{cp.type === "PACKAGE" ? "Pkg" : "Pcs"}: {cp.price}₺</p>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {product.salePrices.map((sp) => (
                                            <p key={sp.id}>{sp.label}: {sp.price}₺</p>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {product.stocks.map((s) => (
                                            <p key={s.id} className={s.quantity <= s.minQuantity ? "text-red-500" : ""}>
                                                {s.type === "PACKAGE" ? "Pkg" : "Pcs"}: {s.quantity}
                                            </p>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/products/${product.id}`)}
                                                className="text-blue-500 hover:underline text-sm"
                                            >
                                                View
                                            </button>
                                            {user?.role === "ADMIN" && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                                                        className="text-yellow-500 hover:underline text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-500 hover:underline text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Products;
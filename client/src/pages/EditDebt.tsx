import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDebtApi, updateDebtApi } from "../api/debt";
import { type ApiError, type Debt } from "../types";

const EditDebt = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        note: "",
    });

    useEffect(() => {
        const fetchDebt = async () => {
            try {
                const data = await getDebtApi(Number(id));
                const debt: Debt = data.debt;
                setFormData({
                    name: debt.name,
                    dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : "",
                    note: debt.note || "",
                });
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || "Failed to fetch debt");
            } finally {
                setIsFetching(false);
            }
        };
        fetchDebt();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await updateDebtApi(Number(id), {
                name: formData.name,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                note: formData.note || null,
            });
            navigate("/dashboard/debts");
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update debt");
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
        <div className="max-w-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Debt</h2>
                <button
                    onClick={() => navigate("/dashboard/debts")}
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
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Updating..." : "Update Debt"}
                </button>
            </form>
        </div>
    );
};

export default EditDebt;
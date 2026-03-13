import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDebtApi } from "../api/debt";
import { type ApiError } from "../types";
import useDebtNames from "../hooks/useDebtNames";

const CreateDebt = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshDebtNames } = useDebtNames();

    const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        note: "",
        initialDebt: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createDebtApi({
                name: formData.name,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
                note: formData.note || undefined,
                initialDebt: formData.initialDebt ? Number(formData.initialDebt) : undefined,
            });
            await refreshDebtNames();
            navigate("/dashboard/debts");
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to create debt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Debt</h2>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Debt</label>
                        <input
                            type="number"
                            name="initialDebt"
                            value={formData.initialDebt}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Creating..." : "Create Debt"}
                </button>
            </form>
        </div>
    );
};

export default CreateDebt;
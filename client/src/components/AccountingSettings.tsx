import { useState, useEffect, useCallback } from "react";
import {
    getFixedExpenseTemplatesApi, createFixedExpenseTemplateApi, updateFixedExpenseTemplateApi, deleteFixedExpenseTemplateApi,
    getAdditionalIncomeTemplatesApi, createAdditionalIncomeTemplateApi, updateAdditionalIncomeTemplateApi, deleteAdditionalIncomeTemplateApi,
    createMonthlyFixedExpenseApi
} from "../api/accounting";
import { type FixedExpenseTemplate, type AdditionalIncomeTemplate, type ApiError } from "../types";

const AccountingSettings = () => {
    const [fixedTemplates, setFixedTemplates] = useState<FixedExpenseTemplate[]>([]);
    const [incomeTemplates, setIncomeTemplates] = useState<AdditionalIncomeTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [addToCurrentMonth, setAddToCurrentMonth] = useState(false);
    const [currentYear] = useState(new Date().getFullYear());
    const [currentMonth] = useState(new Date().getMonth() + 1);

    // Fixed Template Modal
    const [showFixedModal, setShowFixedModal] = useState(false);
    const [editingFixed, setEditingFixed] = useState<FixedExpenseTemplate | null>(null);
    const [fixedModalData, setFixedModalData] = useState({ name: "" });

    // Income Template Modal
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState<AdditionalIncomeTemplate | null>(null);
    const [incomeModalData, setIncomeModalData] = useState({ name: "", dayOfMonth: "" });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fixed, income] = await Promise.all([
                getFixedExpenseTemplatesApi(),
                getAdditionalIncomeTemplatesApi()
            ]);
            setFixedTemplates(fixed.templates);
            setIncomeTemplates(income.templates);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to fetch templates");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Fixed Template handlers
    const openFixedCreate = () => {
        setEditingFixed(null);
        setFixedModalData({ name: "" });
        setShowFixedModal(true);
    };

    const openFixedEdit = (template: FixedExpenseTemplate) => {
        setEditingFixed(template);
        setFixedModalData({ name: template.name });
        setShowFixedModal(true);
    };

    const handleFixedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (editingFixed) {
                await updateFixedExpenseTemplateApi(editingFixed.id, { name: fixedModalData.name });
            } else {
                await createFixedExpenseTemplateApi({ name: fixedModalData.name });
                if (addToCurrentMonth) {
                    await createMonthlyFixedExpenseApi(currentYear, currentMonth, {
                        description: fixedModalData.name
                    });
                }
            }
            await fetchTemplates();
            setShowFixedModal(false);
            setAddToCurrentMonth(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to save template");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFixedToggle = async (template: FixedExpenseTemplate) => {
        try {
            await updateFixedExpenseTemplateApi(template.id, { isActive: !template.isActive });
            await fetchTemplates();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update template");
        }
    };

    const handleFixedDelete = async (id: number) => {
        try {
            await deleteFixedExpenseTemplateApi(id);
            await fetchTemplates();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete template");
        }
    };

    // Income Template handlers
    const openIncomeCreate = () => {
        setEditingIncome(null);
        setIncomeModalData({ name: "", dayOfMonth: "" });
        setShowIncomeModal(true);
    };

    const openIncomeEdit = (template: AdditionalIncomeTemplate) => {
        setEditingIncome(template);
        setIncomeModalData({ name: template.name, dayOfMonth: template.dayOfMonth.toString() });
        setShowIncomeModal(true);
    };

    const handleIncomeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (editingIncome) {
                await updateAdditionalIncomeTemplateApi(editingIncome.id, {
                    name: incomeModalData.name,
                    dayOfMonth: Number(incomeModalData.dayOfMonth)
                });
            } else {
                await createAdditionalIncomeTemplateApi({
                    name: incomeModalData.name,
                    dayOfMonth: Number(incomeModalData.dayOfMonth)
                });
            }
            await fetchTemplates();
            setShowIncomeModal(false);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to save template");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIncomeToggle = async (template: AdditionalIncomeTemplate) => {
        try {
            await updateAdditionalIncomeTemplateApi(template.id, { isActive: !template.isActive });
            await fetchTemplates();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to update template");
        }
    };

    const handleIncomeDelete = async (id: number) => {
        try {
            await deleteAdditionalIncomeTemplateApi(id);
            await fetchTemplates();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || "Failed to delete template");
        }
    };

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-6">
            {error && <div className="col-span-2 bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

            {/* Sabit Gider Şablonları */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-gray-800">Sabit Gider Şablonları</h3>
                    <button
                        onClick={openFixedCreate}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                        + Ekle
                    </button>
                </div>
                {fixedTemplates.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">Henüz şablon yok.</p>
                ) : (
                    <div className="space-y-2">
                        {fixedTemplates.map(template => (
                            <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${template.isActive ? "bg-green-500" : "bg-gray-300"}`}></span>
                                    <span className={`text-sm font-medium ${template.isActive ? "text-gray-800" : "text-gray-400"}`}>
                                        {template.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleFixedToggle(template)}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        {template.isActive ? "Pasif" : "Aktif"}
                                    </button>
                                    <button
                                        onClick={() => openFixedEdit(template)}
                                        className="text-xs text-blue-400 hover:text-blue-600"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleFixedDelete(template.id)}
                                        className="text-xs text-red-400 hover:text-red-600"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ek Gelir Şablonları */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-gray-800">Ek Gelir Şablonları</h3>
                    <button
                        onClick={openIncomeCreate}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                        + Ekle
                    </button>
                </div>
                {incomeTemplates.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">Henüz şablon yok.</p>
                ) : (
                    <div className="space-y-2">
                        {incomeTemplates.map(template => (
                            <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${template.isActive ? "bg-green-500" : "bg-gray-300"}`}></span>
                                    <div>
                                        <span className={`text-sm font-medium ${template.isActive ? "text-gray-800" : "text-gray-400"}`}>
                                            {template.name}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2">her ayın {template.dayOfMonth}i</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleIncomeToggle(template)}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        {template.isActive ? "Pasif" : "Aktif"}
                                    </button>
                                    <button
                                        onClick={() => openIncomeEdit(template)}
                                        className="text-xs text-blue-400 hover:text-blue-600"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleIncomeDelete(template.id)}
                                        className="text-xs text-red-400 hover:text-red-600"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fixed Modal */}
            {showFixedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingFixed ? "Şablon Düzenle" : "Şablon Ekle"}
                        </h3>
                        <form onSubmit={handleFixedSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                <input
                                    type="text"
                                    value={fixedModalData.name}
                                    onChange={(e) => setFixedModalData({ name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Kira, Elektrik vs."
                                    required
                                />
                            </div>
                                                    {!editingFixed && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="addToCurrentMonth"
                                    checked={addToCurrentMonth}
                                    onChange={(e) => setAddToCurrentMonth(e.target.checked)}
                                    className="w-4 h-4 text-blue-500"
                                />
                                <label htmlFor="addToCurrentMonth" className="text-sm text-gray-600">
                                    Mevcut aya da ekle ({currentMonth}/{currentYear})
                                </label>
                            </div>
                        )}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowFixedModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Income Modal */}
            {showIncomeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingIncome ? "Şablon Düzenle" : "Şablon Ekle"}
                        </h3>
                        <form onSubmit={handleIncomeSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                <input
                                    type="text"
                                    value={incomeModalData.name}
                                    onChange={(e) => setIncomeModalData({ ...incomeModalData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Maaş, Kira Geliri vs."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Her Ayın Kaçında Gelir?</label>
                                <input
                                    type="number"
                                    value={incomeModalData.dayOfMonth}
                                    onChange={(e) => setIncomeModalData({ ...incomeModalData, dayOfMonth: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="15"
                                    min={1}
                                    max={31}
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowIncomeModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountingSettings;
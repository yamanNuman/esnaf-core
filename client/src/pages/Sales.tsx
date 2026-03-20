import { useState } from "react";
import NewSale from "../components/NewSale";
import SaleHistory from "../components/SaleHistory";

type TabType = "new" | "history";

const TAB_LABELS: Record<TabType, string> = {
    new: "Yeni Satış",
    history: "Geçmiş",
};

const Sales = () => {
    const [activeTab, setActiveTab] = useState<TabType>("new");

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Satış</h2>
            </div>

            <div className="flex gap-2 mb-6">
                {(Object.keys(TAB_LABELS) as TabType[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === tab
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        }`}
                    >
                        {TAB_LABELS[tab]}
                    </button>
                ))}
            </div>

            {activeTab === "new" && <NewSale />}
            {activeTab === "history" && <SaleHistory />}
        </div>
    );
};

export default Sales;

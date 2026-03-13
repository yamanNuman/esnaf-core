const Dashboard = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-800">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                    <p className="text-3xl font-bold text-red-500">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Categories</p>
                    <p className="text-3xl font-bold text-gray-800">0</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
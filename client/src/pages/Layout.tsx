import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuth from "../hooks/useAuth";
import useCategories from "../hooks/useCategories";
import useDebtNames from "../hooks/useDebtNames";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading, logout } = useAuth();
    const { refreshCategories } = useCategories();
    const { refreshDebtNames } = useDebtNames();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            refreshCategories();
            refreshDebtNames();
        }
    }, [user, refreshCategories, refreshDebtNames]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <p className="text-gray-600 text-sm">
                            Welcome, <span className="font-medium text-gray-800">{user?.name}</span>
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            user?.role === "ADMIN"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                        }`}>
                            {user?.role}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                    >
                        Logout
                    </button>
                </nav>
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
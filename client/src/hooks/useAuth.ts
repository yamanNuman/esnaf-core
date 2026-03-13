import { useEffect, useState } from "react";
import { type User } from "../types";
import { getUserProfileApi, logoutApi } from "../api/auth";

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (window.location.pathname === "/login" || window.location.pathname === "/register") {
                setIsLoading(false);
                return;
            }
            try {
                const data = await getUserProfileApi();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await logoutApi();
            setUser(null);
        } catch {
            console.error("Logout failed")
        }
    };

    return { user, isLoading, logout};
};

export default useAuth;
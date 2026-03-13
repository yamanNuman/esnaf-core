import { useNavigate, useParams } from "react-router-dom"
import api from "../api/axios";
import { useEffect, useState } from "react";
import type { ApiError } from "../types";


const VerifyEmail = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await api.get(`/auth/verify-email/${code}`);
                setSuccess(true);
                setIsLoading(false);
                setTimeout(() => navigate("/login"), 3000);
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || "Verification failed");
            } finally {
                setIsLoading(false);
            }
        };
        if(code) verifyEmail();
    }, [code, navigate]);

if (success) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-500 text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h2>
                <p className="text-gray-500">Redirecting to login...</p>
            </div>
        </div>
    );
}

 if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying your email...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">✕</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <a href="/login" className="text-blue-500 hover:underline">Back to Login</a>
                </div>
            </div>
        );
    }
    return null;
}

export default VerifyEmail;
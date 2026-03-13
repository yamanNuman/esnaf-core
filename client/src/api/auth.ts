import api from './axios';
import {type AuthResponse, type LoginInput, type RegisterInput } from '../types';

export const registerApi = async (data: RegisterInput) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
};

export const loginApi = async (data: LoginInput) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
};

export const logoutApi = async () => {
    const response = await api.get("/auth/logout");
    return response.data;
};

export const getUserProfileApi = async() => {
    const response = await api.get<AuthResponse>("/user/profile");
    return response.data;
};
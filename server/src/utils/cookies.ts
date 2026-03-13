import { CookieOptions, Response } from "express";
import { ACCESS_TOKEN_COOKIE, REFRSH_TOKEN_COOKIE } from "../constants/env";

const secure = process.env.NODE_ENV === "production";

const defaults: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: "strict"
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    maxAge: 1000 * 60 * 15
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/auth/refresh"
});

type Params = {
    res: Response;
    accessToken: string;
    refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenCookieOptions());
    res.cookie(REFRSH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());
    return res;
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRSH_TOKEN_COOKIE, {
        path: "/auth/refresh"
    });
    return res;
};
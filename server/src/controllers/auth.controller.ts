import { Request, Response } from "express";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas/auth.schema";
import { resetPasswordService, verifyEmailService, loginService, logoutService, refreshTokenService, registerService, forgotPasswordService } from "../services/auth.service";
import { clearAuthCookies, getAccessTokenCookieOptions, setAuthCookies } from "../utils/cookies";
import { ACCESS_TOKEN_COOKIE, REFRSH_TOKEN_COOKIE } from "../constants/env";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";

export const registerHandler = async (req: Request, res: Response) => {
    //Zod validation
    const body = registerSchema.parse(req.body);

    //Call Service
    const { user } = await registerService(body);

    //Response
    return res.status(CREATED).json({
        message: "User registered successfully.",
        user
    });
};

export const loginHandler = async (req: Request, res: Response) => {
    //Zod validation
    const body = loginSchema.parse({...req.body, userAgent: req.headers["user-agent"]});

    //Call Service
    const { user, accessToken, refreshToken } = await loginService(body);

    //Cookie
    setAuthCookies({ res, accessToken, refreshToken });

    return res.status(OK).json({
        message: "Login successfull.",
        user
    });
}

export const refreshTokenHandler = async (req: Request, res: Response) => {
    //Cookie Refresh Token
    const refreshToken = req.cookies[REFRSH_TOKEN_COOKIE] as string | undefined;

    appAssert(
        refreshToken,
        UNAUTHORIZED,
        "Refresh token not found",
        AppErrorCode.InvalidRefreshToken
    );

    //Call service
    const { newAccessToken } = await refreshTokenService(refreshToken);

    //Set new AccessToken
    res.cookie(ACCESS_TOKEN_COOKIE, newAccessToken, getAccessTokenCookieOptions());

    return res.status(OK).json({
        message: "Token refreshed successfully."
    });
};

export const logoutHandler = async (req: Request, res: Response) => {

    const sessionId = req.sessionId;

    await logoutService(sessionId);

    return clearAuthCookies(res).status(OK).json({
        message: "Logout successful."
    });
};

export const verifyEmailHandler = async (req: Request, res: Response) => {

    const code = req.params.code as string;

    const { user } =  await verifyEmailService(code);

    return res.status(OK).json({
        message: "Email verified successfully.",
        user
    });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
    //Zod validation
    const { email } = forgotPasswordSchema.parse(req.body);

    //Call Service
    await forgotPasswordService(email);

    return res.status(OK).json({
        message: "Password reset email sent"
    });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
    
    //Zod validation
    const body = resetPasswordSchema.parse(req.body);

    //Call Service
    await resetPasswordService(body);

    //Clear Cookie
    return clearAuthCookies(res).status(OK).json({
        message: "Password reset successful."
    });
};
import { Request, Response } from "express"
import { githubOAuthService } from "../services/github.service";
import { ACCESS_TOKEN_COOKIE, APP_ORIGIN, REFRSH_TOKEN_COOKIE } from "../constants/env";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthCookies } from "../utils/cookies";

export const githubCallbackHandler =  async(req: Request, res: Response) => {
    try {
        const profile = req.user as any;
        const { accessToken, refreshToken } = await githubOAuthService(profile);
        setAuthCookies({res, accessToken, refreshToken});
        res.redirect(`${APP_ORIGIN}/dashboard`);
    } catch (err) {
        res.redirect(`${APP_ORIGIN}/login?error=oauth_failed}`);
    }
};
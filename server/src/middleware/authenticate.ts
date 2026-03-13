import { Request, Response, NextFunction } from "express";
import { ACCESS_TOKEN_COOKIE } from "../constants/env";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { AccessTokenSignOptions, verifyToken } from "../utils/jwt";
import { prisma } from "../prisma/seed";

const authenticate = async(req: Request, res: Response, next: NextFunction) => {
    //Check Cookie AccessToken
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE] as string | undefined;

    appAssert(
        accessToken,
        UNAUTHORIZED,
        "Not Authenticated",
        AppErrorCode.NotAuthenticated
    );

    //Token Decode
    const { payload, error } = verifyToken(accessToken, {
        secret: AccessTokenSignOptions.secret
    });

    appAssert(
        payload,
        UNAUTHORIZED,
        error === "jwt expired" ? "Token expired" : "Invalid Token",
        AppErrorCode.InvalidAccessToken
    );

    //Check DB Session
    const session = await prisma.session.findUnique({
        where: { id: payload.sessionId }
    });

    appAssert(
        session && session.expiresAt > new Date(),
        UNAUTHORIZED,
        "Session Expired",
        AppErrorCode.SessionExpired
    );

    //Request add sessionId and userId
    req.userId = payload.userId;
    req.sessionId = payload.sessionId;

    next();
}

export default authenticate;
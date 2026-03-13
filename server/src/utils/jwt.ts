import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../constants/env";

export type AccessTokenPayload = {
    userId: number;
    sessionId: string;
};

export type RefreshTokenPayload = {
    sessionId: string;
};

type SignOptionsAndSecret = SignOptions & {
    secret: string;
};

const defaults: SignOptions = {
    audience: ["user"],
};

export const AccessTokenSignOptions: SignOptionsAndSecret = {
    secret: JWT_SECRET,
    expiresIn: "15m",
    ...defaults,
};

export const RefreshTokenSignOptions: SignOptionsAndSecret = {
    secret: JWT_REFRESH_SECRET,
    expiresIn: "30d",
    ...defaults,
};

export const signToken = (
    payload: AccessTokenPayload | RefreshTokenPayload,
    options: SignOptionsAndSecret
) => {
    const { secret, ...signOptions } = options;
    return jwt.sign(payload, secret, signOptions);
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
    token: string,
    options: VerifyOptions & { secret: string }
) => {
    const { secret, ...verifyOptions } = options;
    try {
        const payload = jwt.verify(token, secret, {
            ...verifyOptions,
            audience: ["user"] as [string],
        })as TPayload;
        return { payload };
    } catch (err: any) {
        return { error: err.message };
    }
};
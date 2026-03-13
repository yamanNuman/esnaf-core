import 'dotenv/config';

const getEnv = (key: string, defaultValue?: string): string => {

    const value = process.env[key] || defaultValue;

    if(value === undefined) {
        throw new Error(`Missin environment variable ${key}`);
    }
    
    return value;
}

export const PORT = getEnv("PORT", "3000");
export const DATABASE_URL = getEnv("DATABASE_URL");
export const APP_ORIGIN = getEnv("APP_ORIGIN","http://localhost:5173");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const ACCESS_TOKEN_COOKIE = getEnv("ACCESS_TOKEN_COOKIE");
export const REFRSH_TOKEN_COOKIE = getEnv("REFRSH_TOKEN_COOKIE");
export const NODE_ENV = getEnv("NODE_ENV");
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
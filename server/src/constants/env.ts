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
export const GITHUB_CLIENT_ID = getEnv("GITHUB_CLIENT_ID");
export const GITHUB_CLIENT_SECRET = getEnv("GITHUB_CLIENT_SECRET");
export const GITHUB_CALLBACK_URL = getEnv("GITHUB_CALLBACK_URL");
export const SHOP_NAME = getEnv("SHOP_NAME");
export const SHOP_ADDRESS = getEnv("SHOP_ADDRESS");
export const SHOP_PHONE = getEnv("SHOP_PHONE");
export const SHOP_TAX_NO = getEnv("SHOP_TAX_NO");
import * as dotenv from "dotenv";
dotenv.config();

export const jwtSecret = process.env.JWT_SECRET;
export const apiKeyLifetime = process.env.API_KEY_LIFETIME;
export const adminEmail = process.env.ADMIN_EMAIL;

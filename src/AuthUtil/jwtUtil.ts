import { createSecretKey } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { JWTHeaderParameters, JWTPayload } from "jose";
import { API_KEY_LIFETIME } from "../constants/constants";

const secretKey = createSecretKey(process.env.JWT_SECRET as string, "utf-8");

export async function signJwt(
    payload: JWTPayload,
    protectedHeader: JWTHeaderParameters,
) {
    const token = await new SignJWT(payload)
        .setProtectedHeader(protectedHeader)
        .setIssuedAt(new Date())
        .setExpirationTime(new Date(Date.now() + API_KEY_LIFETIME))
        .sign(secretKey);
    return token;
}

export async function verifyJwt(token: string) {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
}

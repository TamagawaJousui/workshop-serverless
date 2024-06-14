import { type UUID, createSecretKey } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { JWTHeaderParameters, JWTPayload } from "jose";
import { API_KEY_LIFETIME } from "../constants/constants";
import { isUuidv4 } from "../dbUtils/isUuidv4";

export const secret = process.env.JWT_SECRET as string;

export const secretKey = createSecretKey(secret, "utf-8");

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

type TokenPayload = {
    sub: UUID;
    iat: number;
    exp: number;
};
export function isTokenPayload(token): token is TokenPayload {
    return (
        token?.sub &&
        token.iat &&
        token.exp &&
        isUuidv4(token.sub) &&
        Number.isInteger(token.iat) &&
        Number.isInteger(token.exp)
    );
}

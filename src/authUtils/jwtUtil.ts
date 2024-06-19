import { createSecretKey, type UUID } from "node:crypto";

import type { JWTHeaderParameters, JWTPayload } from "jose";
import { jwtVerify, SignJWT } from "jose";

import { API_KEY_LIFETIME } from "@/constants/constants";
import { jwtSecret } from "@/env";

export const secret = jwtSecret;

export const secretKey = createSecretKey(secret, "utf-8");

const v4 = new RegExp(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
);

export function isUuidV4(str: string) {
  const lowercase = str?.toLowerCase();
  return v4.test(lowercase);
}

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
    isUuidV4(token.sub) &&
    Number.isInteger(token.iat) &&
    Number.isInteger(token.exp)
  );
}

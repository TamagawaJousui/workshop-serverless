import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * apiKey から User を取り出す
 *
 * @remarks
 * api key の認証と、api key からユーザーの特定を兼ねる関数
 * 認証が失敗した場合、セキュリティの観点から、具体的な原因を明示せずに、
 * 一律に空っぽのオブジェクトを返す
 *
 * @param rawApiKey - ユーザー入力のapi key
 * @returns 入力したapi key の照会結果
 *
 *
 */
export async function getUserByApiKey(rawApiKey: string) {
    const hashedTemporaryApiKey = crypto
        .createHash("sha256")
        .update(rawApiKey)
        .digest("hex");
    const result = await prisma.users.findFirst({
        where: {
            hashed_temporary_api_key: hashedTemporaryApiKey,
            expired_at: {
                gte: new Date(),
            },
        },
    });
    return result;
}

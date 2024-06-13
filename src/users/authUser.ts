import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { compareSync } from "bcryptjs";
import { API_KEY_LIFETIME } from "../constants/constants";
import { genJsonHttpResponse } from "../HttpResponseUtil/genJsonHttpResponse";
import {
    GENERAL_SERVER_ERROR,
    USER_AUTHENTICATION_FAILED,
} from "../constants/error_messages";

const prisma = new PrismaClient();

type AuthUserReqEntity = {
    email: string;
    password: string;
};

function auth(user: AuthUserReqEntity) {
    return prisma.$transaction(async (client) => {
        const userInDb = await client.users.findUnique({
            where: {
                email: user.email,
            },
        });
        if (userInDb === null) {
            return USER_AUTHENTICATION_FAILED;
        }
        const hashedPassword = userInDb.hashed_password;
        if (!compareSync(user.password, hashedPassword)) {
            return USER_AUTHENTICATION_FAILED;
        }
        const rawApiKey = crypto.randomUUID();
        const hashedApiKey = crypto
            .createHash("sha256")
            .update(rawApiKey)
            .digest("hex");
        const expiredAt = new Date(Date.now() + API_KEY_LIFETIME).toISOString();
        await client.users.update({
            where: {
                email: user.email,
            },
            data: {
                hashed_temporary_api_key: hashedApiKey,
                expired_at: expiredAt,
            },
        });
        return genJsonHttpResponse(200, {
            api_key: rawApiKey,
            expired_at: expiredAt,
        });
    });
}

export async function handler(request) {
    const userReq: AuthUserReqEntity = JSON.parse(request.body);
    const result = await auth(userReq).catch((err) => {
        console.warn(err);
        return err;
    });

    if (!(result instanceof Error)) return result;

    return GENERAL_SERVER_ERROR;
}

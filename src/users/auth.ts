import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { compareSync, hashSync } from "bcryptjs";
import {
    API_KEY_LIFETIME,
    GENERAL_SERVER_ERROR,
    SALT_ROUNDS,
    USER_NOT_EXISTS,
    USER_PASSWORD_INCORRECT,
} from "../constants";

const prisma = new PrismaClient();

type UserLogonReqEntity = {
    email: string;
    password: string;
};

function auth(user: UserLogonReqEntity) {
    return prisma.$transaction(async (client) => {
        const userInDb = await client.users.findUnique({
            where: {
                email: user.email,
            },
        });
        if (userInDb === null) {
            return USER_NOT_EXISTS;
        }
        const hashedPassword = userInDb.hashed_password;
        if (!compareSync(user.password, hashedPassword)) {
            return USER_PASSWORD_INCORRECT;
        }
        const apiKey = crypto.randomUUID();
        const saltRounds = SALT_ROUNDS;
        const hashedApiKey = hashSync(apiKey, saltRounds);
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
        return {
            statusCode: 200,
            body: JSON.stringify({
                api_key: hashedApiKey,
                expired_at: expiredAt,
            }),
            headers: { "Content-Type": "application/json" },
        };
    });
}

export async function handler(request) {
    const userReq: UserLogonReqEntity = JSON.parse(request.body);
    const result = await auth(userReq).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result.statusCode) {
        return result;
    }

    return GENERAL_SERVER_ERROR;
}

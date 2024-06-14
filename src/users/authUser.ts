import { PrismaClient } from "@prisma/client";
import { compareSync } from "bcryptjs";
import { signJwt } from "../authUtils/jwtUtil";
import { USER_AUTHENTICATION_FAILED } from "../constants/errorMessages";

const prisma = new PrismaClient();

type AuthUserReqEntity = {
    email: string;
    password: string;
};

async function signIn(userReq: AuthUserReqEntity) {
    const userInDb = await prisma.users.findUnique({
        where: {
            email: userReq.email,
        },
    });
    if (userInDb === null) {
        return userInDb;
    }
    const hashedPassword = userInDb.hashed_password;
    if (!compareSync(userReq.password, hashedPassword)) {
        return null;
    }
    return userInDb;
}

export async function handler(request) {
    const userReq: AuthUserReqEntity = JSON.parse(request.body);
    const userInDb = await signIn(userReq).catch((err) => {
        console.warn(err);
        return err;
    });

    if (userInDb === null) {
        return USER_AUTHENTICATION_FAILED;
    }

    const payload = {
        sub: userInDb.id,
    };
    const protectedHeader = {
        alg: "HS256",
        typ: "JWT",
    };
    const jwt = await signJwt(payload, protectedHeader);
    return {
        statusCode: 200,
        body: JSON.stringify({ JWT: jwt }),
        headers: { "Content-Type": "application/json" },
    };
}

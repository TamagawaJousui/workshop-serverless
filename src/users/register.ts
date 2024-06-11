import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    SALT_ROUNDS,
    SUCCESS_RESULT,
    USER_EMAIL_DUPLICATED,
} from "../constants";

const prisma = new PrismaClient();

type UserRegisterReqEntity = {
    name: string;
    email: string;
    password: string;
};

async function createUser(user: UserRegisterReqEntity) {
    const saltRounds = SALT_ROUNDS;
    const hashedPassword = hashSync(user.password, saltRounds);
    const UserCreatedEntity = {
        name: user.name,
        email: user.email,
        hashed_password: hashedPassword,
    };
    const result = await prisma.users.create({ data: UserCreatedEntity });
    return result;
}

export async function handler(request) {
    const userReq: UserRegisterReqEntity = JSON.parse(request.body);
    const result = await createUser(userReq).catch((err) => {
        return err;
    });
    if (result?.name === userReq.name && result?.email === userReq.email) {
        return SUCCESS_RESULT;
    }
    if (result.code === PRISMA_ERROR_CODE.P2002) {
        return USER_EMAIL_DUPLICATED;
    }

    return GENERAL_SERVER_ERROR;
}

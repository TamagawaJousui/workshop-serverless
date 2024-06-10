import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import {
    SALT_ROUNDS,
    SUCCESS_RESULT,
    PRISMA_ERROR_CODE,
    USER_EMAIL_DUPLICATED,
    GENERAL_SERVER_ERROR,
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
    await prisma.users.create({ data: UserCreatedEntity });
}

export async function handler(request) {
    const userReq: UserRegisterReqEntity = JSON.parse(request.body);
    const result = await createUser(userReq).catch((err) => {
        return err;
    });
    if (!result) {
        return SUCCESS_RESULT;
    }
    if (result.code === PRISMA_ERROR_CODE.P2002) {
        return USER_EMAIL_DUPLICATED;
    }

    return GENERAL_SERVER_ERROR;
}

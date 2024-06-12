import { PrismaClient } from "@prisma/client";
import { hashSync, genSaltSync } from "bcryptjs";
import { SALT_ROUNDS, SUCCESS_RESULT } from "../constants/constants";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    USER_EMAIL_DUPLICATED,
} from "../constants/error_messages";

const prisma = new PrismaClient();

type UserRegisterReqEntity = {
    name: string;
    email: string;
    password: string;
};

async function createUser(user: UserRegisterReqEntity) {
    const hashedPassword = hashSync(user.password, SALT_ROUNDS);
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
        console.warn(err);
        return err;
    });
    if (result?.id) {
        return SUCCESS_RESULT;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2002) {
        return USER_EMAIL_DUPLICATED;
    }

    return GENERAL_SERVER_ERROR;
}

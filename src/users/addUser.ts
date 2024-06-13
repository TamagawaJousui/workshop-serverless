import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hashSync } from "bcryptjs";
import { SALT_ROUNDS, SUCCESS_RESULT } from "../constants/constants";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    USER_EMAIL_DUPLICATED,
} from "../constants/error_messages";

const prisma = new PrismaClient();

type AddUserReqEntity = {
    name: string;
    email: string;
    password: string;
};

async function createUser(user: AddUserReqEntity) {
    const hashedPassword = hashSync(user.password, SALT_ROUNDS);
    const addUserCreateEntity = {
        name: user.name,
        email: user.email,
        hashed_password: hashedPassword,
    };
    const result = await prisma.users.create({ data: addUserCreateEntity });
    return result;
}

export async function handler(request) {
    const userReq: AddUserReqEntity = JSON.parse(request.body);
    const result = await createUser(userReq).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) {
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2002
        ) {
            return USER_EMAIL_DUPLICATED;
        }

        return GENERAL_SERVER_ERROR;
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            id: result.id,
            name: result.name,
            email: result.email,
        }),
        headers: { "Content-Type": "application/json" },
    };
}

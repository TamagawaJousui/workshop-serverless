import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hashSync } from "bcryptjs";
import createError from "http-errors";
import { SALT_ROUNDS } from "../constants/constants";
import {
    PRISMA_ERROR_CODE,
    USER_EMAIL_DUPLICATED_ERROR_MESSAGE,
} from "../constants/errorMessages";
import { addUserschema } from "../constants/schemas";

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

export async function lambdaHandler(request) {
    const payload: AddUserReqEntity = request.body;
    const result = await createUser(payload).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) {
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2002
        ) {
            throw createError(400, USER_EMAIL_DUPLICATED_ERROR_MESSAGE);
        }
        throw createError(500);
    }

    const response = (({ id, name, email }) => ({ id, name, email }))(result);
    return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: { "Content-Type": "application/json" },
    };
}

export const handler = middy()
    .use(jsonBodyParser())
    .use(validator({ eventSchema: transpileSchema(addUserschema) }))
    .use(httpErrorHandler())
    .handler(lambdaHandler);

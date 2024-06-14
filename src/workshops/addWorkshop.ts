import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import jwtAuthMiddleware, {
    EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";
import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import { API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE } from "../constants/errorMessages";
import { addEditWorkshopSchema } from "../constants/schemas";

const prisma = new PrismaClient();

async function addWorkShop(workshop: AddWorkshopCreateEntity) {
    const result = await prisma.workshops.create({
        data: workshop,
    });
    return result;
}

export async function lambdaHandler(request) {
    const payload: AddWorkshopReqEntity = request.body;
    const userUuid = request.auth.payload.sub;

    const addWorkshopCreateEntity = {
        ...payload,
        user_id: userUuid,
    };
    const result = await addWorkShop(addWorkshopCreateEntity).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) {
        if (result instanceof PrismaClientKnownRequestError) {
            // 外部キー制約のエラーとが出た場合、ユーザーがすでに存在しないことを示していますので、認証失敗のエラーを出す。
            throw createError(400, API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE);
        }
        throw createError(500);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

export const handler = middy()
    .use(jsonBodyParser())
    .use(httpHeaderNormalizer())
    .use(validator({ eventSchema: transpileSchema(addEditWorkshopSchema) }))
    .use(
        jwtAuthMiddleware({
            algorithm: EncryptionAlgorithms.HS256,
            credentialsRequired: true,
            isPayload: isTokenPayload,
            secretOrPublicKey: secret,
        }),
    )
    .use(httpErrorHandler())
    .handler(lambdaHandler);

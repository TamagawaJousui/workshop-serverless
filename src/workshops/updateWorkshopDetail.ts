import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import jwtAuthMiddleware, {
    EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";
import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
    PRISMA_ERROR_CODE,
    WORKSHOP_NOT_EXISTS_ERROR_MESSAGE,
} from "../constants/errorMessages";
import createError from "http-errors";
import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import { updateWorkshopSchema } from "../constants/schemas";

const prisma = new PrismaClient();

type UpdateWorkshopReqEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};

type UpdateWorkshopEntity = {
    id: string;
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    user_id: string;
};

async function updateWorkshopDetail(
    updateWorkshopEntity: UpdateWorkshopEntity,
) {
    const result = await prisma.workshops.update({
        where: {
            id: updateWorkshopEntity.id,
            user_id: updateWorkshopEntity.user_id,
        },
        data: updateWorkshopEntity,
    });
    return result;
}

export async function lambdaHandler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    const payload: UpdateWorkshopReqEntity = request.body;
    const userUuid = request.auth.payload.sub;

    const updateWorkshopEntity = {
        ...payload,
        id: workshopUuid,
        user_id: userUuid,
    };

    const result = await updateWorkshopDetail(updateWorkshopEntity).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );

    if (result instanceof Error) {
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2025
        ) {
            throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
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
    .use(validator({ eventSchema: transpileSchema(updateWorkshopSchema) }))
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

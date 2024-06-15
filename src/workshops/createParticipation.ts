import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import jwtAuthMiddleware, {
    EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError, { HttpError } from "http-errors";
import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import { createParticipationSchema } from "../constants/schemas";
import type { UUID } from "node:crypto";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
    PRISMA_ERROR_CODE,
    WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE,
    WORKSHOP_UUID_NOT_EXISTS_ERROR_MESSAGE,
    API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE,
} from "../constants/errorMessages";

const prisma = new PrismaClient();

function createParticipation(workshopUuid: UUID, userUuid: UUID) {
    return prisma.$transaction(async (client) => {
        const participationsInDb = await client.participations.findMany({
            where: {
                user_id: userUuid,
                workshop_id: workshopUuid,
                canceled_at: null,
            },
        });

        if (participationsInDb.length !== 0) {
            throw createError(
                400,
                WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE,
            );
        }

        const result = await client.participations.create({
            data: {
                user_id: userUuid,
                workshop_id: workshopUuid,
                participation_at: new Date(),
            },
        });
        return result;
    });
}

export async function lambdaHandler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    const userUuid = request.auth.payload.sub;

    const result = await createParticipation(workshopUuid, userUuid).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );
    if (result instanceof Error) {
        if (result instanceof HttpError) {
            throw result;
        }
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2003 &&
            (result.meta?.field_name as string).includes("workshop_id_fkey")
        ) {
            throw createError(400, WORKSHOP_UUID_NOT_EXISTS_ERROR_MESSAGE);
        }
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2003 &&
            (result.meta?.field_name as string).includes("user_id_fkey")
        ) {
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
    .use(httpHeaderNormalizer())
    .use(
        validator({
            eventSchema: transpileSchema(createParticipationSchema),
        }),
    )
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

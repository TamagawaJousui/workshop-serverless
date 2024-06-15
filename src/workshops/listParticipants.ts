import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import jwtAuthMiddleware, {
    EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";
import { PrismaClient } from "@prisma/client";
import createError from "http-errors";
import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import { listParticipantsSchema } from "../constants/schemas";
import type { UUID } from "node:crypto";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import { WORKSHOP_NOT_EXISTS_ERROR_MESSAGE } from "../constants/errorMessages";

const prisma = new PrismaClient();

async function listParticipants(workshopUuid: UUID, userUuid: UUID) {
    const workshop = await prisma.workshops.findUnique({
        where: {
            id: workshopUuid,
            user_id: userUuid,
            canceled_at: null,
        },
    });

    if (workshop === null) {
        throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
    }

    const result = await prisma.participations.findMany({
        where: {
            workshop_id: workshopUuid,
            canceled_at: null,
        },
        include: {
            users: {
                select: {
                    email: true,
                },
            },
        },
    });
    const emailList = result.map((participant) => participant.users.email);
    return emailList;
}

export async function lambdaHandler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    const userUuid = request.auth.payload.sub;

    const result = await listParticipants(workshopUuid, userUuid);

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
            eventSchema: transpileSchema(listParticipantsSchema),
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

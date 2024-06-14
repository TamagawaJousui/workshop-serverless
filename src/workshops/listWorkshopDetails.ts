import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import { PARAMETER_OF_WORKSHOR_LIST_QUERY } from "../constants/constants";
import createError from "http-errors";
import { listWorkshopDetailsSchema } from "../constants/schemas";
import type { Status } from "../constants/constants";

const prisma = new PrismaClient();

async function listWorkshopDetails(status: Status) {
    const whereCondition: Record<string, object | undefined> = {
        start_at: undefined,
        end_at: undefined,
    };

    const currentTime = new Date();
    switch (status) {
        case "ended":
            whereCondition.end_at = {
                lte: currentTime,
            };
            break;
        case "ongoing":
            whereCondition.start_at = {
                lte: currentTime,
            };
            whereCondition.end_at = {
                gte: currentTime,
            };
            break;
        case "scheduled":
            whereCondition.start_at = {
                gte: currentTime,
            };
            break;
    }

    const result = await prisma.workshops.findMany({
        where: whereCondition,
    });
    return result;
}

export async function lambdaHandler(request) {
    const status =
        request.queryStringParameters[PARAMETER_OF_WORKSHOR_LIST_QUERY];

    const result = await listWorkshopDetails(status).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) {
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
    .use(validator({ eventSchema: transpileSchema(listWorkshopDetailsSchema) }))
    .use(httpErrorHandler())
    .handler(lambdaHandler);

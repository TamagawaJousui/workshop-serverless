import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import {
    DEFAULT_STATUS,
    PARAMETER_OF_WORKSHOR_LIST_QUERY,
} from "../constants/constants";
import { GENERAL_SERVER_ERROR } from "../constants/errorMessages";
import { listWorkshopDetailsSchema } from "../constants/schemas";

type Status = "all" | "ended" | "ongoing" | "scheduled";

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
    console.log(request);
    const status =
        request.queryStringParameters?.[PARAMETER_OF_WORKSHOR_LIST_QUERY];
    console.log(status);

    const result = await listWorkshopDetails(status).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) return GENERAL_SERVER_ERROR;

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

import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    WORKSHOP_STATUS_TYPE_INCORRECT,
} from "../constants/error_messages";
import {
    DEFAULT_STATUS,
    PARAMETER_OF_WORKSHOR_LIST_QUERY,
    WORKSHOP_STATUS_TYPE_ARRY,
} from "../constants/constants";
import { genJsonHttpResponse } from "../HttpResponseUtil/genJsonHttpResponse";
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

export async function handler(request) {
    const status =
        request.queryStringParameters?.[PARAMETER_OF_WORKSHOR_LIST_QUERY] ??
        DEFAULT_STATUS;
    if (!WORKSHOP_STATUS_TYPE_ARRY.includes(status)) {
        return WORKSHOP_STATUS_TYPE_INCORRECT;
    }

    const result = await listWorkshopDetails(status).catch((err) => {
        console.warn(err);
        return err;
    });

    if (!(result instanceof Error)) return genJsonHttpResponse(200, result);

    return GENERAL_SERVER_ERROR;
}

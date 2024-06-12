import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants/error_messages";
import { genJsonHttpResponse } from "../HttpResponseUtil/genJsonHttpResponse";
import type { UUID } from "node:crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const PARAMETER_OF_WORKSHOP_UUID = "workshop_UUID";

const prisma = new PrismaClient();

async function getWorkShopDetail(workshopUuid: UUID) {
    const result = await prisma.workshops.findUnique({
        where: {
            id: workshopUuid,
        },
    });
    return result;
}

export async function handler(request) {
    console.log(request);
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    const result = await getWorkShopDetail(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result === null) {
        return WORKSHOP_UUID_NOT_EXISTS;
    }

    if (!(result instanceof Error)) return genJsonHttpResponse(200, result);

    if (
        result instanceof PrismaClientKnownRequestError &&
        result.code === PRISMA_ERROR_CODE.P2023
    )
        return WORKSHOP_UUID_FORMAT_INCORRECT;

    return GENERAL_SERVER_ERROR;
}

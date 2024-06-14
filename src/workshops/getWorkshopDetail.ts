import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants/errorMessages";

const prisma = new PrismaClient();

export async function getWorkShopDetail(workshopUuid: UUID) {
    const result = await prisma.workshops.findUnique({
        where: {
            id: workshopUuid,
        },
    });
    return result;
}

export async function handler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    const result = await getWorkShopDetail(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) {
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2023
        )
            return WORKSHOP_UUID_FORMAT_INCORRECT;

        return GENERAL_SERVER_ERROR;
    }

    if (result === null) {
        return WORKSHOP_UUID_NOT_EXISTS;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

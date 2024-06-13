import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_NOT_EXISTS,
    WORKSHOP_UUID_FORMAT_INCORRECT,
} from "../constants/error_messages";
import {
    SUCCESS_RESULT,
    PARAMETER_OF_WORKSHOP_UUID,
} from "../constants/constants";
import type { UUID } from "node:crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function deleteWorkshop(workshopUuid: UUID) {
    await prisma.workshops.delete({
        where: {
            id: workshopUuid,
        },
    });
    return SUCCESS_RESULT;
}

export async function handler(request) {
    console.log(request);
    const workshopUuid: UUID =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_UUID];

    const result = await deleteWorkshop(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

    if (!(result instanceof Error)) return result;

    if (
        result instanceof PrismaClientKnownRequestError &&
        result.code === PRISMA_ERROR_CODE.P2023
    ) {
        return WORKSHOP_UUID_FORMAT_INCORRECT;
    }
    if (
        result instanceof PrismaClientKnownRequestError &&
        result.code === PRISMA_ERROR_CODE.P2025
    ) {
        return WORKSHOP_UUID_NOT_EXISTS;
    }

    return GENERAL_SERVER_ERROR;
}

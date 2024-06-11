import { PrismaClient } from "@prisma/client";
import {
    SUCCESS_RESULT,
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_NOT_EXISTS,
    WORKSHOP_UUID_FORMAT_INCORRECT,
} from "../constants";
import type { UUID } from "node:crypto";

const PARAMETER_OF_WORKSHOP_UUID = "workshop_UUID";

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
    const workshopUuid: UUID =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_UUID];

    const result = await deleteWorkshop(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

    console.warn(result);
    if (result.statusCode) {
        return result;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2023) {
        return WORKSHOP_UUID_FORMAT_INCORRECT;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2025) {
        return WORKSHOP_UUID_NOT_EXISTS;
    }

    return GENERAL_SERVER_ERROR;
}

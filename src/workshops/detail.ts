import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    isError,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants";
import type { UUID } from "node:crypto";

const PARAMETER_OF_WORKSHOP_UUID = "workshop_UUID";

const prisma = new PrismaClient();

async function findWorkShopDetail(workshopUuid: UUID) {
    const result = await prisma.workshops.findUnique({
        where: {
            id: workshopUuid,
        },
    });
    return result;
}

export async function handler(request) {
    const workshopUuid: UUID =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_UUID];
    const result = await findWorkShopDetail(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });
    if (result === null) {
        return WORKSHOP_UUID_NOT_EXISTS;
    }
    if (!isError(result))
        return {
            statusCode: 200,
            body: JSON.stringify(result ?? {}),
            headers: { "Content-Type": "application/json" },
        };
    if (result?.code === PRISMA_ERROR_CODE.P2023) {
        return WORKSHOP_UUID_FORMAT_INCORRECT;
    }
    return GENERAL_SERVER_ERROR;
}

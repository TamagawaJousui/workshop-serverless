import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
    API_KEY_AUTHENTICATION_FAILED,
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    USER_AUTHORITY_FAILED,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants/errorMessages";
import { getWorkShopDetail } from "./getWorkshopDetail";

const prisma = new PrismaClient();

async function deleteWorkshop(workshopUuid: UUID) {
    const result = await prisma.workshops.delete({
        where: {
            id: workshopUuid,
        },
    });
    return result;
}

export async function handler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    // bearerToken の検証は未実装
    const bearerToken: string = request.headers.Authorization.slice(
        "Bearer ".length,
    );

    const user = await getUserByApiKey(bearerToken).catch((err) => {
        console.warn(err);
        return err;
    });
    if (user instanceof Error) return GENERAL_SERVER_ERROR;
    if (user === null) return API_KEY_AUTHENTICATION_FAILED;

    const workshop = await getWorkShopDetail(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });
    if (workshop instanceof Error) {
        if (
            workshop instanceof PrismaClientKnownRequestError &&
            workshop.code === PRISMA_ERROR_CODE.P2023
        )
            return WORKSHOP_UUID_FORMAT_INCORRECT;

        return GENERAL_SERVER_ERROR;
    }
    if (workshop === null) return WORKSHOP_UUID_NOT_EXISTS;

    if (user.id !== workshop.user_id) return USER_AUTHORITY_FAILED;

    const result = await deleteWorkshop(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) {
        if (
            result instanceof PrismaClientKnownRequestError &&
            result.code === PRISMA_ERROR_CODE.P2025
        )
            return WORKSHOP_UUID_NOT_EXISTS;
        return GENERAL_SERVER_ERROR;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

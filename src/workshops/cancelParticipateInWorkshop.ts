import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { isUuidv4 } from "../DBUtil/isUuidv4";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
    API_KEY_AUTHENTICATION_FAILED,
    GENERAL_SERVER_ERROR,
    WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED,
    WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
    WORKSHOP_PARTICIPANT_RECORD_CORRUPTED,
    WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants/error_messages";
import { getUserByApiKey } from "../users/getUserByApiKey";
import { getWorkShopDetail } from "./getWorkshopDetail";

const prisma = new PrismaClient();

function cancelParticipateWorkshop(workshopUuid: UUID, userUuid: UUID) {
    return prisma.$transaction(async (client) => {
        const participationsInDb = await client.participations.findMany({
            where: {
                user_id: userUuid,
                workshop_id: workshopUuid,
                canceled_at: null,
            },
        });

        if (participationsInDb.length === 0)
            throw new Error(
                WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
            );
        if (participationsInDb.length > 1)
            throw new Error(
                WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE,
            );

        const result = await client.participations.update({
            where: {
                id: participationsInDb[0].id,
                user_id: userUuid,
                workshop_id: workshopUuid,
            },
            data: {
                canceled_at: new Date(),
            },
        });
        return result;
    });
}

export async function handler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    if (!isUuidv4(workshopUuid)) return WORKSHOP_UUID_FORMAT_INCORRECT;

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
    if (workshop instanceof Error) return GENERAL_SERVER_ERROR;
    if (workshop === null) return WORKSHOP_UUID_NOT_EXISTS;

    const result = await cancelParticipateWorkshop(workshopUuid, user.id).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );
    if (result instanceof Error) {
        if (
            result.message ===
            WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE
        )
            return WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED;
        if (
            request.message ===
            WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE
        )
            return WORKSHOP_PARTICIPANT_RECORD_CORRUPTED;
        return GENERAL_SERVER_ERROR;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

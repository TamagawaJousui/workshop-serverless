import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
    API_KEY_AUTHENTICATION_FAILED,
    GENERAL_SERVER_ERROR,
    WORKSHOP_PARTICIPANT_DUPLICATED,
    WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants/errorMessages";
import { isUuidv4 } from "../dbUtils/isUuidv4";
import { getWorkShopDetail } from "./getWorkshopDetail";

const prisma = new PrismaClient();

function participateInWorkshop(workshopUuid: UUID, userUuid: UUID) {
    return prisma.$transaction(async (client) => {
        const participationsInDb = await client.participations.findMany({
            where: {
                user_id: userUuid,
                workshop_id: workshopUuid,
                canceled_at: null,
            },
        });

        if (participationsInDb.length !== 0)
            throw new Error(WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE);

        const result = await client.participations.create({
            data: {
                user_id: userUuid,
                workshop_id: workshopUuid,
                participation_at: new Date(),
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

    const result = await participateInWorkshop(workshopUuid, user.id).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );
    if (result instanceof Error) {
        if (result.message === WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE)
            return WORKSHOP_PARTICIPANT_DUPLICATED;

        return GENERAL_SERVER_ERROR;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

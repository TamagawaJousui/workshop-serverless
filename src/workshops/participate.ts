import { PrismaClient } from "@prisma/client";
import {
    SUCCESS_RESULT,
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    USER_NOT_EXISTS,
    WORKSHOP_UUID_NOT_EXISTS,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_PARTICIPANT_DUPLICATED,
} from "../constants";
import type { UUID } from "node:crypto";

const PARAMETER_OF_WORKSHOP_UUID = "workshop_UUID";
const PARAMETER_OF_WORKSHOP_PARTICIPANT_EMAIL = "user_email";

const prisma = new PrismaClient();

function participateWorkshop(workshopUuid: UUID, userEmail: string) {
    return prisma.$transaction(async (client) => {
        const workshopInDb = await client.workshops.findUnique({
            where: {
                id: workshopUuid,
            },
        });
        if (workshopInDb === null) {
            return WORKSHOP_UUID_NOT_EXISTS;
        }

        const userInDb = await client.users.findUnique({
            where: {
                email: userEmail,
            },
        });
        if (userInDb === null) {
            return USER_NOT_EXISTS;
        }

        const result = await client.participations.create({
            data: {
                user_id: userInDb.id,
                workshop_id: workshopInDb.id,
                participation_at: new Date(),
            },
        });
        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: { "Content-Type": "application/json" },
        };
    });
}

export async function handler(request) {
    const workshopUuid: UUID =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_UUID];
    const userEmail: string =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_PARTICIPANT_EMAIL];

    const result = await participateWorkshop(workshopUuid, userEmail).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );

    console.warn(result);
    if (result.statusCode) {
        return result;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2002) {
        return WORKSHOP_PARTICIPANT_DUPLICATED;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2023) {
        return WORKSHOP_UUID_FORMAT_INCORRECT;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2025) {
        return WORKSHOP_UUID_NOT_EXISTS;
    }

    return GENERAL_SERVER_ERROR;
}

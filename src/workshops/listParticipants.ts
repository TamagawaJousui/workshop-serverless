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

const prisma = new PrismaClient();

async function listParticipants(workshopUuid: UUID) {
    const result = await prisma.participations.findMany({
        where: {
            workshop_id: workshopUuid,
            canceled_at: null,
        },
        include: {
            users: true,
        },
    });
    const emailList = result.map((participant) => participant.users.email);
    return {
        statusCode: 200,
        body: JSON.stringify(emailList),
        headers: { "Content-Type": "application/json" },
    };
}

export async function handler(request) {
    const workshopUuid: UUID =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_UUID];

    const result = await listParticipants(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

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

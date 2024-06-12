import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants/error_messages";
import type { UUID } from "node:crypto";
import type { WorkshopCreateEntity } from "../constants/error_messages";

type WorkshopUpdateEntity = {
    workshop_uuid: UUID;
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};

const PARAMETER_OF_WORKSHOP_UUID = "workshop_UUID";

const prisma = new PrismaClient();

function updateWorkshop(workshopUpdateEntity: WorkshopUpdateEntity) {
    return prisma.$transaction(async (client) => {
        const workshopInDb = await client.workshops.findUnique({
            where: {
                id: workshopUpdateEntity.workshop_uuid,
            },
        });
        if (workshopInDb === null) {
            return WORKSHOP_UUID_NOT_EXISTS;
        }

        const result = await client.workshops.update({
            where: {
                id: workshopUpdateEntity.workshop_uuid,
            },
            data: {
                start_at: workshopUpdateEntity.start_at,
                end_at: workshopUpdateEntity.end_at,
                participation_method: workshopUpdateEntity.participation_method,
                content: workshopUpdateEntity.content,
                preparation: workshopUpdateEntity.preparation,
                materials: workshopUpdateEntity.materials,
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
    const body: WorkshopCreateEntity = JSON.parse(request.body);
    const workshopUpdateEntity: WorkshopUpdateEntity = {
        ...body,
        workshop_uuid: workshopUuid,
    };

    const result = await updateWorkshop(workshopUpdateEntity).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result.statusCode) {
        return result;
    }
    if (result?.code === PRISMA_ERROR_CODE.P2023) {
        return WORKSHOP_UUID_FORMAT_INCORRECT;
    }

    return GENERAL_SERVER_ERROR;
}

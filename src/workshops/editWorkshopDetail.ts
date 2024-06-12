import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
    API_KEY_AUTHENTICATION_FAILED,
    USER_AUTHORITY_FAILED,
} from "../constants/error_messages";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import { getUserByApiKey } from "../users/getUserByApiKey";
import { getWorkShopDetail } from "./getWorkshopDetail";
import { genJsonHttpResponse } from "../HttpResponseUtil/genJsonHttpResponse";
import type { UUID } from "node:crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type EditWorkshopReqEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    api_key: UUID;
};

type EditWorkshopUpdateEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    user_id: UUID;
};

const prisma = new PrismaClient();

function editWorkshopDetail(
    workshopUpdateEntity: EditWorkshopUpdateEntity,
    workshopUuid,
) {
    return prisma.$transaction(async (client) => {
        const workshopInDb = await client.workshops.findUnique({
            where: {
                id: workshopUuid,
            },
        });
        if (workshopInDb === null) {
            return WORKSHOP_UUID_NOT_EXISTS;
        }

        const result = await client.workshops.update({
            where: {
                id: workshopUuid,
            },
            data: workshopUpdateEntity,
        });
        return genJsonHttpResponse(200, result);
    });
}

export async function handler(request) {
    const workshopUuid: UUID =
        request?.pathParameters?.[PARAMETER_OF_WORKSHOP_UUID];
    const workshopReq: EditWorkshopReqEntity = JSON.parse(request.body);

    const user = await getUserByApiKey(workshopReq.api_key).catch((err) => {
        console.warn(err);
        return err;
    });
    if (user instanceof Error) return GENERAL_SERVER_ERROR;
    if (user === null) return API_KEY_AUTHENTICATION_FAILED;

    const workshop = await getWorkShopDetail(workshopUuid).catch((err) => {
        console.warn(err);
        return err;
    });

    if (
        workshop instanceof PrismaClientKnownRequestError &&
        workshop.code === PRISMA_ERROR_CODE.P2023
    )
        return WORKSHOP_UUID_FORMAT_INCORRECT;
    if (workshop instanceof Error) return GENERAL_SERVER_ERROR;
    if (workshop === null) return WORKSHOP_UUID_NOT_EXISTS;

    if (user.id !== workshop.user_id) return USER_AUTHORITY_FAILED;

    const workshopUpdateEntity: EditWorkshopUpdateEntity = {
        start_at: workshopReq.start_at,
        end_at: workshopReq.end_at,
        participation_method: workshopReq.participation_method,
        content: workshopReq.content,
        preparation: workshopReq.preparation,
        materials: workshopReq.materials,
        user_id: user.id,
    };

    const result = await editWorkshopDetail(
        workshopUpdateEntity,
        workshopUuid,
    ).catch((err) => {
        console.warn(err);
        return err;
    });

    if (!(result instanceof Error)) return result;

    return GENERAL_SERVER_ERROR;
}

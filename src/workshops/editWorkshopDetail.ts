import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    PRISMA_ERROR_CODE,
    WORKSHOP_UUID_FORMAT_INCORRECT,
    WORKSHOP_UUID_NOT_EXISTS,
    API_KEY_AUTHENTICATION_FAILED,
    USER_AUTHORITY_FAILED,
    WORKSHOP_UUID_NOT_EXISTS_ERROR_MESSAGE,
} from "../constants/error_messages";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import { getUserByApiKey } from "../users/getUserByApiKey";
import { getWorkShopDetail } from "./getWorkshopDetail";
import type { UUID } from "node:crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type EditWorkshopReqEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};

type EditWorkshopUpdateEntity = {
    id: UUID;
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    user_id: UUID;
};

const prisma = new PrismaClient();

async function editWorkshopDetail(
    workshopUpdateEntity: EditWorkshopUpdateEntity,
) {
    const result = await prisma.workshops.update({
        where: {
            id: workshopUpdateEntity.id,
        },
        data: workshopUpdateEntity,
    });
    return result;
}

export async function handler(request) {
    const workshopUuid: UUID =
        request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
    const workshopReq: EditWorkshopReqEntity = JSON.parse(request.body);
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

    // TODO もっとうまいやり方はあるはずです
    const workshopUpdateEntity: EditWorkshopUpdateEntity = {
        id: workshopUuid,
        start_at: workshopReq.start_at,
        end_at: workshopReq.end_at,
        participation_method: workshopReq.participation_method,
        content: workshopReq.content,
        preparation: workshopReq.preparation,
        materials: workshopReq.materials,
        user_id: user.id,
    };

    const result = await editWorkshopDetail(workshopUpdateEntity).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );

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

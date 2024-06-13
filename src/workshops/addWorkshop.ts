import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
    API_KEY_AUTHENTICATION_FAILED,
    GENERAL_SERVER_ERROR,
} from "../constants/error_messages";
import { getUserByApiKey } from "../users/getUserByApiKey";

type AddWorkshopReqEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};

type AddWorkshopCreateEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    user_id: UUID;
};

const prisma = new PrismaClient();

async function addWorkShop(workshop: AddWorkshopCreateEntity) {
    const result = await prisma.workshops.create({
        data: workshop,
    });
    return result;
}

export async function handler(request) {
    const workshopReq: AddWorkshopReqEntity = JSON.parse(request.body);
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

    // TODO もっとうまいやり方はあるはずです
    const addWorkshopCreateEntity: AddWorkshopCreateEntity = {
        start_at: workshopReq.start_at,
        end_at: workshopReq.end_at,
        participation_method: workshopReq.participation_method,
        content: workshopReq.content,
        preparation: workshopReq.preparation,
        materials: workshopReq.materials,
        user_id: user.id,
    };

    const result = await addWorkShop(addWorkshopCreateEntity).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result instanceof Error) return GENERAL_SERVER_ERROR;

    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

import { PrismaClient, type users } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    API_KEY_AUTHENTICATION_FAILED,
} from "../constants/error_messages";
import { getUserByApiKey } from "../users/getUserByApiKey";
import { genJsonHttpResponse } from "../HttpResponseUtil/genJsonHttpResponse";
import type { UUID } from "node:crypto";

type AddWorkshopRequestEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    api_key: UUID;
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
    console.log(workshop);
    const result = await prisma.workshops.create({
        data: workshop,
    });
    return result;
}

export async function handler(request) {
    const addWorkshopRequestEntity: AddWorkshopRequestEntity = JSON.parse(
        request.body,
    );

    const user = await getUserByApiKey(addWorkshopRequestEntity.api_key).catch(
        (err) => {
            console.warn(err);
            return err;
        },
    );
    if (user instanceof Error) return GENERAL_SERVER_ERROR;
    if (user === null) return API_KEY_AUTHENTICATION_FAILED;

    // TODO もっとうまいやり方はあるはずです
    const addWorkshopCreateEntity: AddWorkshopCreateEntity = {
        start_at: addWorkshopRequestEntity.start_at,
        end_at: addWorkshopRequestEntity.end_at,
        participation_method: addWorkshopRequestEntity.participation_method,
        content: addWorkshopRequestEntity.content,
        preparation: addWorkshopRequestEntity.preparation,
        materials: addWorkshopRequestEntity.materials,
        user_id: user.id as UUID,
    };

    const result = await addWorkShop(addWorkshopCreateEntity).catch((err) => {
        console.warn(err);
        return err;
    });
    console.log(result);
    // TODO 返す値の判定はもっと適切の方法はありますかな
    if (result?.id) return genJsonHttpResponse(200, result);

    return GENERAL_SERVER_ERROR;
}

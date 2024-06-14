import type { UUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { verifyJwt } from "../authUtils/jwtUtil";
import {
    API_KEY_AUTHENTICATION_FAILED,
    PRISMA_ERROR_CODE,
} from "../constants/errorMessages";
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

    const jwtPayload = await verifyJwt(bearerToken).catch((err) => {
        console.warn(err);
        return err;
    });
    if (jwtPayload instanceof Error) {
        return API_KEY_AUTHENTICATION_FAILED;
    }
    const addWorkshopCreateEntity: AddWorkshopCreateEntity = {
        ...workshopReq,
        user_id: jwtPayload.sub,
    };

    const result = await addWorkShop(addWorkshopCreateEntity).catch((err) => {
        console.warn(err);
        return err;
    });

    if (
        result instanceof PrismaClientKnownRequestError &&
        result.code === PRISMA_ERROR_CODE.P2003
    ) {
        // 外部キー制約のエラーが出た場合、ユーザーがすでに存在しないことを示していますので、認証失敗のエラーを出す。
        return API_KEY_AUTHENTICATION_FAILED;
    }
    return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
    };
}

import { PrismaClient } from "@prisma/client";
import { GENERAL_SERVER_ERROR, SUCCESS_RESULT } from "../constants";

type WorkshopCreateEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};

const prisma = new PrismaClient();

async function createWorkShop(workshop: WorkshopCreateEntity) {
    const result = await prisma.workshops.create({
        data: workshop,
    });
    console.log(result);
    return result;
}

export async function handler(request) {
    const workshopCreateEntity: WorkshopCreateEntity = JSON.parse(request.body);
    const result = await createWorkShop(workshopCreateEntity).catch((err) => {
        return err;
    });
    if (result?.id) {
        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: { "Content-Type": "application/json" },
        };
    }

    return GENERAL_SERVER_ERROR;
}

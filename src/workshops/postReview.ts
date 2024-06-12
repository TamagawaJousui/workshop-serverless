import { PrismaClient } from "@prisma/client";
import {
    GENERAL_SERVER_ERROR,
    USER_NOT_EXISTS,
    WORKSHOP_UUID_NOT_EXISTS,
} from "../constants";
import type { UUID } from "node:crypto";

type ReviewPostEntity = {
    user_email: string;
    workshop_id: UUID;
    content: string;
};

const prisma = new PrismaClient();

function postReview(reviewCreateEntity: ReviewPostEntity) {
    return prisma.$transaction(async (client) => {
        const workshopInDb = await client.workshops.findUnique({
            where: {
                id: reviewCreateEntity.workshop_id,
            },
        });
        if (workshopInDb === null) {
            return WORKSHOP_UUID_NOT_EXISTS;
        }

        const userInDb = await client.users.findUnique({
            where: {
                email: reviewCreateEntity.user_email,
            },
        });
        if (userInDb === null) {
            return USER_NOT_EXISTS;
        }

        const reviewCreateEntiry = {
            user_id: userInDb.id,
            workshop_id: workshopInDb.id,
            content: reviewCreateEntity.content,
            reviewed_at: new Date(),
        };
        const result = await prisma.reviews.create({
            data: reviewCreateEntiry,
        });

        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: { "Content-Type": "application/json" },
        };
    });
}

export async function handler(request) {
    const reviewCreateEntity: ReviewPostEntity = JSON.parse(request.body);

    const result = await postReview(reviewCreateEntity).catch((err) => {
        console.warn(err);
        return err;
    });

    if (result.statusCode) {
        return result;
    }

    return GENERAL_SERVER_ERROR;
}

import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type Review = {
  workshop_id: UUID;
  content: string;
};

/**
 * @throws {@link PrismaClientKnownRequestError}
 *  code: 'P2003', if user or workshop doesn't exists
 */
export async function createReview(review: Review, userUuid: UUID) {
  const result = await prisma.reviews.create({
    data: { ...review, user_id: userUuid, reviewed_at: new Date() },
  });

  return result;
}

import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type Review = {
  content: string;
};

export type ReviewWithUserIdAndWorkshopId = Review & {
  workshop_id: UUID;
  user_id: UUID;
};

/**
 * @throws {@link PrismaClientKnownRequestError}
 *  code: 'P2003', if user or workshop doesn't exists
 */
export async function createReview(review: ReviewWithUserIdAndWorkshopId) {
  const result = await prisma.reviews.create({
    data: { ...review, reviewed_at: new Date() },
  });

  return result;
}

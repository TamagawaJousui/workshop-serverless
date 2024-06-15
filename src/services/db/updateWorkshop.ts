import { PrismaClient } from "@prisma/client";

import type { Workshop } from "@/services/db/createWorkshop";

const prisma = new PrismaClient();

export type { Workshop };
export type WorkshopWithIdAndUserId = Workshop & {
  id: string;
  user_id: string;
};

/**
 * @throws {@link PrismaClientKnownRequestError}
 *  code: 'P2025', if workshop with correct user id doesn't exists
 */
export async function updateWorkshop(workshop: WorkshopWithIdAndUserId) {
  const result = await prisma.workshops.update({
    where: {
      id: workshop.id,
      user_id: workshop.user_id,
    },
    data: workshop,
  });
  return result;
}

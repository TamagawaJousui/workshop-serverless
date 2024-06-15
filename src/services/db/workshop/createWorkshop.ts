import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type Workshop = {
  start_at: string;
  end_at: string;
  participation_method: string;
  content?: string;
  preparation?: string;
  materials?: string;
};

export type WorkshopWithUserId = Workshop & {
  user_id: string;
};

/**
 * @throws {@link PrismaClientKnownRequestError}
 *  code: 'P2003', if user doesn't exists
 */
export async function createWorkShop(workshop: WorkshopWithUserId) {
  const result = await prisma.workshops.create({
    data: workshop,
  });
  return result;
}

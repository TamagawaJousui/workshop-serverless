import { PrismaClient } from "@prisma/client";
import type { UUID } from "node:crypto";

const prisma = new PrismaClient();

export async function getWorkShop(workshopUuid: UUID) {
  const result = await prisma.workshops.findUnique({
    where: {
      id: workshopUuid,
    },
  });
  return result;
}

import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getWorkShop(workshopUuid: UUID) {
  const result = await prisma.workshops.findUnique({
    where: {
      id: workshopUuid,
    },
  });
  return result;
}

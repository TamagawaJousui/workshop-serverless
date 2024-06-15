import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function markPointProcessed(workshopUuids: UUID[]) {
  const workshops = await prisma.workshops.updateMany({
    where: {
      id: { in: workshopUuids },
      yumex_point_processed_at: null,
    },
    data: {
      yumex_point_processed_at: new Date(),
    },
  });

  return workshops;
}

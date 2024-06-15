import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUser(userUuid: UUID) {
  const user = await prisma.users.findUnique({
    where: {
      id: userUuid,
    },
  });
  return user;
}

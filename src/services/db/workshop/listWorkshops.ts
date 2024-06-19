import { PrismaClient } from "@prisma/client";

import type { Status } from "@/constants/constants";

const prisma = new PrismaClient();

export async function listWorkshops(status: Status) {
  const whereCondition: Record<string, object | undefined> = {
    start_at: undefined,
    end_at: undefined,
  };

  const currentTime = new Date();
  switch (status) {
    case "ended":
      whereCondition.end_at = {
        lte: currentTime,
      };
      break;
    case "ongoing":
      whereCondition.start_at = {
        lte: currentTime,
      };
      whereCondition.end_at = {
        gte: currentTime,
      };
      break;
    case "scheduled":
      whereCondition.start_at = {
        gte: currentTime,
      };
      break;
  }

  const result = await prisma.workshops.findMany({
    where: whereCondition,
  });
  return result;
}

import { PrismaClient } from "@prisma/client";
import { compareSync } from "bcryptjs";

const prisma = new PrismaClient();

export type Auth = {
  email: string;
  password: string;
};

export async function signInUser(auth: Auth) {
  const userInDb = await prisma.users.findUnique({
    where: {
      email: auth.email,
    },
  });
  if (userInDb === null) {
    return userInDb;
  }
  const hashedPassword = userInDb.hashed_password;
  if (!compareSync(auth.password, hashedPassword)) {
    return null;
  }
  return userInDb;
}

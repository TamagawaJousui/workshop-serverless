import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { SALT_ROUNDS } from "../constants/constants";

export type User = {
  name: string;
  email: string;
  password: string;
};

const prisma = new PrismaClient();

export async function createUser(user: User) {
  const hashedPassword = hashSync(user.password, SALT_ROUNDS);
  const addUserCreateEntity = {
    name: user.name,
    email: user.email,
    hashed_password: hashedPassword,
  };
  const result = await prisma.users.create({ data: addUserCreateEntity });
  return result;
}

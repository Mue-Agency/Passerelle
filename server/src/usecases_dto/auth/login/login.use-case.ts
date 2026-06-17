import { compare } from "bcrypt";
import { prisma } from "../../../lib/prisma";
import type { LoginDtoIn, LoginDtoOut } from "./login.dto";

export async function login(dto: LoginDtoIn): Promise<LoginDtoOut> {
  const user = await prisma.user.findFirst({
    where: { firstName: dto.firstName },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const match = await compare(dto.password, user.passwordHash);
  if (!match) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    role: user.role,
  };
}

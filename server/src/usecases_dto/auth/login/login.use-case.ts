import { compare } from "bcrypt";
import { prisma } from "../../../lib/prisma";
import type { LoginDtoIn, LoginDtoOut } from "./login.dto";

export async function login(dto: LoginDtoIn): Promise<LoginDtoOut> {
  const users = await prisma.user.findMany({
    where: { firstName: dto.firstName },
  });

  if (users.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  for (const user of users) {
    const match = await compare(dto.password, user.passwordHash);
    if (match) {
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
      };
    }
  }

  throw new Error("INVALID_CREDENTIALS");
}

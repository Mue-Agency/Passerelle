import { hash } from "bcrypt";
import { timingSafeEqual } from "crypto";
import { prisma } from "../../../lib/prisma";
import { generateUsername } from "../../../lib/username";
import type { RegisterAdminDtoIn, RegisterAdminDtoOut } from "./register-admin.dto";

const SALT_ROUNDS = 10;
const ADMIN_SECRET = process.env.ADMIN_REGISTRATION_SECRET;

export async function registerAdmin(dto: RegisterAdminDtoIn): Promise<RegisterAdminDtoOut> {
  if (
    !ADMIN_SECRET ||
    dto.secret.length !== ADMIN_SECRET.length ||
    !timingSafeEqual(Buffer.from(dto.secret), Buffer.from(ADMIN_SECRET))
  ) {
    throw new Error("INVALID_SECRET");
  }

  const passwordHash = await hash(dto.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const username = await generateUsername(tx, dto.firstName);

    return tx.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        username,
        passwordHash,
        role: "ADMIN",
      },
    });
  });

  return {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    role: user.role,
  };
}

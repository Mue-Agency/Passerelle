import { hash } from "bcrypt";
import { prisma } from "../../../lib/prisma";
import type { RegisterAdminDtoIn, RegisterAdminDtoOut } from "./register-admin.dto";

const SALT_ROUNDS = 10;
const ADMIN_SECRET = process.env.ADMIN_REGISTRATION_SECRET;

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function generateUsername(firstName: string): Promise<string> {
  const base = slugify(firstName);
  const existing = await prisma.user.findFirst({ where: { username: base } });
  if (!existing) return base;

  let suffix = 2;
  while (true) {
    const candidate = `${base}${suffix}`;
    const found = await prisma.user.findFirst({ where: { username: candidate } });
    if (!found) return candidate;
    suffix++;
  }
}

export async function registerAdmin(dto: RegisterAdminDtoIn): Promise<RegisterAdminDtoOut> {
  if (dto.secret !== ADMIN_SECRET) {
    throw new Error("INVALID_SECRET");
  }

  const username = await generateUsername(dto.firstName);
  const passwordHash = await hash(dto.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      firstName: dto.firstName,
      lastName: dto.lastName,
      username,
      passwordHash,
      role: "ADMIN",
    },
  });

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
}

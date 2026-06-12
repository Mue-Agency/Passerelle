import { hash } from "bcrypt";
import { prisma } from "../../../lib/prisma";
import type { RegisterDtoIn, RegisterDtoOut } from "./register.dto";

const SALT_ROUNDS = 10;

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

async function findOrCreateSession(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  baseGroupId: string,
): Promise<string> {
  const baseGroup = await tx.group.findUniqueOrThrow({
    where: { id: baseGroupId },
  });

  const sessions = await tx.group.findMany({
    where: { baseGroupId },
    include: { _count: { select: { members: true } } },
    orderBy: { sessionNumber: "asc" },
  });

  // Also check the base group itself
  const baseCount = await tx.groupMember.count({
    where: { groupId: baseGroupId },
  });

  if (baseCount < baseGroup.maxMembers) {
    return baseGroupId;
  }

  for (const session of sessions) {
    if (session._count.members < session.maxMembers) {
      return session.id;
    }
  }

  const nextNumber = sessions.length > 0
    ? sessions[sessions.length - 1].sessionNumber + 1
    : 2;

  const newSession = await tx.group.create({
    data: {
      name: baseGroup.name,
      lieu: baseGroup.lieu,
      maxMembers: baseGroup.maxMembers,
      sessionNumber: nextNumber,
      baseGroupId,
    },
  });

  return newSession.id;
}

export async function register(dto: RegisterDtoIn): Promise<RegisterDtoOut> {
  const username = await generateUsername(dto.firstName);
  const passwordHash = await hash(dto.password, SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        username,
        passwordHash,
        role: "CITOYEN",
      },
    });

    let assignedGroupId: string | undefined;

    if (dto.groupId) {
      assignedGroupId = await findOrCreateSession(tx, dto.groupId);
      await tx.groupMember.create({
        data: { userId: u.id, groupId: assignedGroupId },
      });
    }

    return { user: u, groupId: assignedGroupId };
  });

  return {
    userId: result.user.id,
    username: result.user.username,
    role: result.user.role,
    groupId: result.groupId,
  };
}

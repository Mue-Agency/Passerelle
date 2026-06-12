import { prisma } from "../../../lib/prisma";
import type { JoinGroupDtoIn, JoinGroupDtoOut } from "./join-group.dto";

export async function joinGroup(dto: JoinGroupDtoIn): Promise<JoinGroupDtoOut> {
  const baseGroup = await prisma.group.findUnique({
    where: { id: dto.groupId },
    include: { _count: { select: { members: true } } },
  });
  if (!baseGroup) throw new Error("GROUP_NOT_FOUND");

  const baseId = baseGroup.baseGroupId ?? baseGroup.id;

  const allSessions = await prisma.group.findMany({
    where: {
      OR: [{ id: baseId }, { baseGroupId: baseId }],
    },
    orderBy: { sessionNumber: "asc" },
    include: {
      _count: { select: { members: true } },
      members: { where: { userId: dto.userId }, select: { id: true } },
    },
  });

  const alreadyMember = allSessions.some((s) => s.members.length > 0);
  if (alreadyMember) throw new Error("ALREADY_MEMBER");

  const available = allSessions.find(
    (s) => s._count.members < s.maxMembers,
  );

  if (available) {
    const member = await prisma.groupMember.create({
      data: { userId: dto.userId, groupId: available.id },
    });
    return {
      id: member.id,
      userId: dto.userId,
      groupId: available.id,
      sessionNumber: available.sessionNumber,
      joinedAt: member.joinedAt,
    };
  }

  const original = allSessions[0];
  const newSessionNumber = allSessions.length + 1;

  const result = await prisma.$transaction(async (tx) => {
    const newSession = await tx.group.create({
      data: {
        name: original.name,
        lieu: original.lieu,
        maxMembers: original.maxMembers,
        sessionNumber: newSessionNumber,
        baseGroupId: baseId,
      },
    });

    const member = await tx.groupMember.create({
      data: { userId: dto.userId, groupId: newSession.id },
    });

    return { member, sessionNumber: newSession.sessionNumber, groupId: newSession.id };
  });

  return {
    id: result.member.id,
    userId: dto.userId,
    groupId: result.groupId,
    sessionNumber: result.sessionNumber,
    joinedAt: result.member.joinedAt,
  };
}

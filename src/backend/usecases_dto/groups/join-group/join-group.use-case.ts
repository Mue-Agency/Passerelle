import { prisma } from "@/backend/lib/prisma";
import { JoinGroupDtoIn, JoinGroupDtoOut } from "./join-group.dto";

export async function joinGroup(dto: JoinGroupDtoIn): Promise<JoinGroupDtoOut> {
  const group = await prisma.group.findUnique({ where: { id: dto.groupId } });
  if (!group) throw new Error("GROUP_NOT_FOUND");

  const user = await prisma.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: dto.groupId } },
  });
  if (existing) throw new Error("ALREADY_MEMBER");

  const member = await prisma.groupMember.create({
    data: { userId: dto.userId, groupId: dto.groupId },
  });

  return {
    groupId:  member.groupId,
    userId:   member.userId,
    joinedAt: member.joinedAt,
  };
}

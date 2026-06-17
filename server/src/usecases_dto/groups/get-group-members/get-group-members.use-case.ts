import { prisma } from "../../../lib/prisma";
import type { GetGroupMembersDtoIn, GetGroupMembersDtoOut } from "./get-group-members.dto";

export async function getGroupMembers(dto: GetGroupMembersDtoIn): Promise<GetGroupMembersDtoOut> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: dto.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const group = await prisma.group.findUnique({
    where: { id: dto.groupId },
    select: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!group) throw new Error("GROUP_NOT_FOUND");

  return { members: group.members.map((m) => m.user) };
}

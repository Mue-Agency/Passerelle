import { prisma } from "@/backend/lib/prisma";
import { GetGroupDtoIn, GetGroupDtoOut } from "./get-group.dto";

export async function getGroup(dto: GetGroupDtoIn): Promise<GetGroupDtoOut> {
  const group = await prisma.group.findUnique({
    where: { id: dto.groupId },
    include: { _count: { select: { members: true } } },
  });

  if (!group) {
    throw new Error("GROUP_NOT_FOUND");
  }

  return {
    id:          group.id,
    name:        group.name,
    memberCount: group._count.members,
    createdAt:   group.createdAt,
  };
}

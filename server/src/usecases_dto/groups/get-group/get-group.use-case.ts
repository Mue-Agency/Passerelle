import { prisma } from "../../../lib/prisma";
import type { GetGroupDtoIn, GetGroupDtoOut } from "./get-group.dto";

export async function getGroup(dto: GetGroupDtoIn): Promise<GetGroupDtoOut> {
  const group = await prisma.group.findUnique({
    where: { id: dto.groupId },
    select: { id: true, name: true, lieu: true, maxMembers: true },
  });

  if (!group) throw new Error("GROUP_NOT_FOUND");

  return group;
}

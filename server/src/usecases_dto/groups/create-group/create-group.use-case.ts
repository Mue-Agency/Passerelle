import { prisma } from "../../../lib/prisma";
import type { CreateGroupDtoIn, CreateGroupDtoOut } from "./create-group.dto";

export async function createGroup(dto: CreateGroupDtoIn): Promise<CreateGroupDtoOut> {
  const group = await prisma.group.create({
    data: {
      name: dto.name,
      lieu: dto.lieu,
      sessionNumber: 1,
      baseGroupId: null,
    },
  });

  return {
    id: group.id,
    name: group.name,
    lieu: group.lieu,
    maxMembers: group.maxMembers,
    sessionNumber: group.sessionNumber,
    createdAt: group.createdAt,
  };
}

import { prisma } from "../../../lib/prisma";
import type { CreateJoinMessageDtoIn, CreateJoinMessageDtoOut } from "./create-join-message.dto";

export async function createJoinMessage(dto: CreateJoinMessageDtoIn): Promise<CreateJoinMessageDtoOut> {
  const message = await prisma.message.create({
    data: {
      groupId: dto.groupId,
      userId: dto.userId,
      type: "JOIN",
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return {
    id: message.id,
    type: message.type,
    content: message.content,
    sentAt: message.sentAt,
    user: message.user,
    outing: null,
  };
}

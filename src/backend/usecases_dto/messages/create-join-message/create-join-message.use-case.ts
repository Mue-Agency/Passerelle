import { prisma } from "@/backend/lib/prisma";
import { CreateJoinMessageDtoIn, CreateJoinMessageDtoOut } from "./create-join-message.dto";

export async function createJoinMessage(dto: CreateJoinMessageDtoIn): Promise<CreateJoinMessageDtoOut> {
  const [message, user] = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        groupId: dto.groupId,
        userId:  dto.userId,
        type:    "JOIN",
      },
    });
    const user = await tx.user.findUniqueOrThrow({
      where:  { id: dto.userId },
      select: { id: true, firstName: true, lastName: true },
    });
    return [message, user];
  });

  return {
    id:      message.id,
    type:    "JOIN",
    content: null,
    sentAt:  message.sentAt,
    user,
    outing:  null,
  };
}

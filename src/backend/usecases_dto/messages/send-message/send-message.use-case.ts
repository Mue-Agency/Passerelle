import { prisma } from "@/backend/lib/prisma";
import { SendMessageDtoIn, SendMessageDtoOut } from "./send-message.dto";

export async function sendMessage(dto: SendMessageDtoIn): Promise<SendMessageDtoOut> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: dto.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const message = await prisma.message.create({
    data: {
      groupId: dto.groupId,
      userId:  dto.userId,
      type:    "TEXT",
      content: dto.content,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return {
    id:      message.id,
    type:    message.type,
    content: message.content,
    sentAt:  message.sentAt,
    user:    message.user,
    outing:  null,
  };
}

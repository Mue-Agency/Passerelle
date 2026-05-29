import { prisma } from "@/backend/lib/prisma";
import { GetMessagesDtoIn, GetMessagesDtoOut } from "./get-messages.dto";

export async function getMessages(dto: GetMessagesDtoIn): Promise<GetMessagesDtoOut> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: dto.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const messages = await prisma.message.findMany({
    where:   { groupId: dto.groupId },
    orderBy: { sentAt: "asc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      outing: {
        include: { _count: { select: { participants: true } } },
      },
    },
  });

  return messages.map((msg) => ({
    id:      msg.id,
    type:    msg.type,
    content: msg.content,
    sentAt:  msg.sentAt,
    user:    msg.user,
    outing:  msg.outing
      ? {
          id:               msg.outing.id,
          title:            msg.outing.title,
          date:             msg.outing.date,
          location:         msg.outing.location,
          maxSpots:         msg.outing.maxSpots,
          participantCount: msg.outing._count.participants,
        }
      : null,
  }));
}

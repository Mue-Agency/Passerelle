import { prisma } from "@/backend/lib/prisma";
import { ProposeOutingDtoIn, ProposeOutingDtoOut } from "./propose-outing.dto";

export async function proposeOuting(dto: ProposeOutingDtoIn): Promise<ProposeOutingDtoOut> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: dto.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const [outing, user] = await prisma.$transaction(async (tx) => {
    const outing = await tx.outing.create({
      data: {
        title:    dto.title,
        date:     dto.date,
        location: dto.location,
        maxSpots: dto.maxSpots,
        groupId:  dto.groupId,
        userId:   dto.userId,
      },
    });

    await tx.message.create({
      data: {
        groupId:  dto.groupId,
        userId:   dto.userId,
        type:     "OUTING",
        outingId: outing.id,
      },
    });

    const user = await tx.user.findUniqueOrThrow({
      where:  { id: dto.userId },
      select: { id: true, firstName: true, lastName: true },
    });

    return [outing, user];
  });

  return {
    id:      outing.id,
    type:    "OUTING",
    content: null,
    sentAt:  new Date(),
    user,
    outing: {
      id:               outing.id,
      title:            outing.title,
      date:             outing.date,
      location:         outing.location,
      maxSpots:         outing.maxSpots,
      participantCount: 0,
    },
  };
}

import { prisma } from "../../../lib/prisma";
import type { ProposeOutingDtoIn, ProposeOutingDtoOut } from "./propose-outing.dto";

export async function proposeOuting(dto: ProposeOutingDtoIn): Promise<ProposeOutingDtoOut> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: dto.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const [outing, user] = await prisma.$transaction(async (tx) => {
    const hasPoll = Array.isArray(dto.pollOptions) && dto.pollOptions.length > 0;

    const outing = await tx.outing.create({
      data: {
        title: dto.title,
        date: new Date(dto.date),
        location: dto.location,
        maxSpots: dto.maxSpots ?? 3,
        groupId: dto.groupId,
        userId: dto.userId,
        recurring: dto.recurring ?? false,
        hasPoll,
      },
    });

    if (hasPoll) {
      await tx.outingPollOption.createMany({
        data: dto.pollOptions!.map((dt) => ({
          outingId: outing.id,
          dateTime: new Date(dt),
        })),
      });
    }

    await tx.message.create({
      data: {
        groupId: dto.groupId,
        userId: dto.userId,
        type: "OUTING",
        outingId: outing.id,
      },
    });

    const user = await tx.user.findUniqueOrThrow({
      where: { id: dto.userId },
      select: { id: true, firstName: true, lastName: true },
    });

    return [outing, user] as const;
  });

  return {
    id: outing.id,
    type: "OUTING",
    content: null,
    sentAt: new Date(),
    user,
    outing: {
      id: outing.id,
      title: outing.title,
      date: outing.date,
      location: outing.location,
      maxSpots: outing.maxSpots,
      participantCount: 0,
      isParticipant: false,
    },
  };
}

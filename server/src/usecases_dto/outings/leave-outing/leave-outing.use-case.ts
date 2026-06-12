import { prisma } from "../../../lib/prisma";
import type { LeaveOutingDtoIn, LeaveOutingDtoOut } from "./leave-outing.dto";

export async function leaveOuting(dto: LeaveOutingDtoIn): Promise<LeaveOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where: { id: dto.outingId },
    include: { _count: { select: { participants: true } } },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");

  const existing = await prisma.outingParticipant.findUnique({
    where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
  });
  if (!existing) throw new Error("NOT_PARTICIPANT");

  await prisma.outingParticipant.delete({
    where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
  });

  return {
    participantCount: outing._count.participants - 1,
    groupId: outing.groupId,
    outing: {
      id: outing.id,
      title: outing.title,
      date: outing.date,
      location: outing.location,
      maxSpots: outing.maxSpots,
    },
  };
}

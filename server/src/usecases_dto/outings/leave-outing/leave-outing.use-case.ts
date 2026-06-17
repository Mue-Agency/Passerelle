import { prisma } from "../../../lib/prisma";
import type { LeaveOutingDtoIn, LeaveOutingDtoOut } from "./leave-outing.dto";

export async function leaveOuting(dto: LeaveOutingDtoIn): Promise<LeaveOutingDtoOut> {
  return prisma.$transaction(async (tx) => {
    const outing = await tx.outing.findUnique({
      where: { id: dto.outingId },
    });
    if (!outing) throw new Error("OUTING_NOT_FOUND");

    const existing = await tx.outingParticipant.findUnique({
      where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
    });
    if (!existing) throw new Error("NOT_PARTICIPANT");

    await tx.outingParticipant.delete({
      where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
    });

    const participantCount = await tx.outingParticipant.count({
      where: { outingId: dto.outingId, status: "ACCEPTED" },
    });

    return {
      participantCount,
      groupId: outing.groupId,
      outing: {
        id: outing.id,
        title: outing.title,
        date: outing.date,
        location: outing.location,
        maxSpots: outing.maxSpots,
      },
    };
  });
}

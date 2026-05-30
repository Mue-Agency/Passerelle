import { prisma } from "@/backend/lib/prisma";
import { LeaveOutingDtoIn, LeaveOutingDtoOut } from "./leave-outing.dto";

export async function leaveOuting(dto: LeaveOutingDtoIn): Promise<LeaveOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where: { id: dto.outingId },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");

  const participant = await prisma.outingParticipant.findUnique({
    where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
  });
  if (!participant) throw new Error("NOT_PARTICIPANT");

  await prisma.outingParticipant.delete({
    where: { id: participant.id },
  });

  const participantCount = await prisma.outingParticipant.count({
    where: { outingId: dto.outingId },
  });

  return {
    outingId:         dto.outingId,
    userId:           dto.userId,
    participantCount,
    spotsLeft:        outing.maxSpots - participantCount,
  };
}

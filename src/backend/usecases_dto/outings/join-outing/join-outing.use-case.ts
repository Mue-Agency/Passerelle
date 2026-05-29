import { prisma } from "@/backend/lib/prisma";
import { JoinOutingDtoIn, JoinOutingDtoOut } from "./join-outing.dto";

export async function joinOuting(dto: JoinOutingDtoIn): Promise<JoinOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where:   { id: dto.outingId },
    include: { _count: { select: { participants: true } } },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: outing.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  if (outing._count.participants >= outing.maxSpots) throw new Error("OUTING_FULL");

  const existing = await prisma.outingParticipant.findUnique({
    where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
  });
  if (existing) throw new Error("ALREADY_PARTICIPANT");

  await prisma.outingParticipant.create({
    data: { outingId: dto.outingId, userId: dto.userId },
  });

  const participantCount = outing._count.participants + 1;

  return {
    outingId:         dto.outingId,
    userId:           dto.userId,
    participantCount,
    spotsLeft:        outing.maxSpots - participantCount,
  };
}

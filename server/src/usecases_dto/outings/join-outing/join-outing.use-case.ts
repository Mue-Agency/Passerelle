import { prisma } from "../../../lib/prisma";
import type { JoinOutingDtoIn, JoinOutingDtoOut } from "./join-outing.dto";

export async function joinOuting(dto: JoinOutingDtoIn): Promise<JoinOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where: { id: dto.outingId },
    include: { _count: { select: { participants: true } } },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: outing.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  if (outing._count.participants >= outing.maxSpots) throw new Error("NO_SPOTS_LEFT");

  const existing = await prisma.outingParticipant.findUnique({
    where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
  });

  if (existing && existing.status === "ACCEPTED") throw new Error("ALREADY_PARTICIPANT");

  if (existing) {
    await prisma.outingParticipant.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED" },
    });
  } else {
    await prisma.outingParticipant.create({
      data: { outingId: dto.outingId, userId: dto.userId, status: "ACCEPTED" },
    });
  }

  return {
    participantCount: outing._count.participants + 1,
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

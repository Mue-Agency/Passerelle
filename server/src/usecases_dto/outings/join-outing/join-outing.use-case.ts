import { prisma } from "../../../lib/prisma";
import type { JoinOutingDtoIn, JoinOutingDtoOut } from "./join-outing.dto";

export async function joinOuting(dto: JoinOutingDtoIn): Promise<JoinOutingDtoOut> {
  return prisma.$transaction(async (tx) => {
    const outing = await tx.outing.findUnique({
      where: { id: dto.outingId },
    });
    if (!outing) throw new Error("OUTING_NOT_FOUND");

    const member = await tx.groupMember.findUnique({
      where: { userId_groupId: { userId: dto.userId, groupId: outing.groupId } },
    });
    if (!member) throw new Error("NOT_MEMBER");

    const acceptedCount = await tx.outingParticipant.count({
      where: { outingId: dto.outingId, status: "ACCEPTED" },
    });

    if (acceptedCount >= outing.maxSpots) throw new Error("NO_SPOTS_LEFT");

    const existing = await tx.outingParticipant.findUnique({
      where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
    });

    if (existing && existing.status === "ACCEPTED") throw new Error("ALREADY_PARTICIPANT");

    if (existing) {
      await tx.outingParticipant.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" },
      });
    } else {
      await tx.outingParticipant.create({
        data: { outingId: dto.outingId, userId: dto.userId, status: "ACCEPTED" },
      });
    }

    return {
      participantCount: acceptedCount + 1,
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

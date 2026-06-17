import { prisma } from "../../../lib/prisma";
import type { RefuseOutingDtoIn, RefuseOutingDtoOut } from "./refuse-outing.dto";

export async function refuseOuting(dto: RefuseOutingDtoIn): Promise<RefuseOutingDtoOut> {
  return prisma.$transaction(async (tx) => {
    const outing = await tx.outing.findUnique({
      where: { id: dto.outingId },
    });
    if (!outing) throw new Error("OUTING_NOT_FOUND");

    const member = await tx.groupMember.findUnique({
      where: { userId_groupId: { userId: dto.userId, groupId: outing.groupId } },
    });
    if (!member) throw new Error("NOT_MEMBER");

    const existing = await tx.outingParticipant.findUnique({
      where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
    });

    if (existing && existing.status === "REFUSED") throw new Error("ALREADY_REFUSED");

    if (existing) {
      await tx.outingParticipant.update({
        where: { id: existing.id },
        data: { status: "REFUSED" },
      });
    } else {
      await tx.outingParticipant.create({
        data: { outingId: dto.outingId, userId: dto.userId, status: "REFUSED" },
      });
    }

    const [acceptedCount, refusedCount] = await Promise.all([
      tx.outingParticipant.count({ where: { outingId: dto.outingId, status: "ACCEPTED" } }),
      tx.outingParticipant.count({ where: { outingId: dto.outingId, status: "REFUSED" } }),
    ]);

    return { acceptedCount, refusedCount, groupId: outing.groupId };
  });
}

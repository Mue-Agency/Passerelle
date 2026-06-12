import { prisma } from "../../../lib/prisma";
import type { RefuseOutingDtoIn, RefuseOutingDtoOut } from "./refuse-outing.dto";

export async function refuseOuting(dto: RefuseOutingDtoIn): Promise<RefuseOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where: { id: dto.outingId },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: outing.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const existing = await prisma.outingParticipant.findUnique({
    where: { outingId_userId: { outingId: dto.outingId, userId: dto.userId } },
  });

  if (existing && existing.status === "REFUSED") throw new Error("ALREADY_REFUSED");

  if (existing) {
    await prisma.outingParticipant.update({
      where: { id: existing.id },
      data: { status: "REFUSED" },
    });
  } else {
    await prisma.outingParticipant.create({
      data: { outingId: dto.outingId, userId: dto.userId, status: "REFUSED" },
    });
  }

  const [acceptedCount, refusedCount] = await Promise.all([
    prisma.outingParticipant.count({ where: { outingId: dto.outingId, status: "ACCEPTED" } }),
    prisma.outingParticipant.count({ where: { outingId: dto.outingId, status: "REFUSED" } }),
  ]);

  return { acceptedCount, refusedCount, groupId: outing.groupId };
}
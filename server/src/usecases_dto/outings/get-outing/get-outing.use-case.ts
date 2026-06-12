import { prisma } from "../../../lib/prisma";
import type { GetOutingDtoIn, GetOutingDtoOut } from "./get-outing.dto";

export async function getOuting(dto: GetOutingDtoIn): Promise<GetOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where: { id: dto.outingId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      participants: {
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: outing.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const participantCount = outing.participants.length;

  return {
    id: outing.id,
    title: outing.title,
    date: outing.date,
    location: outing.location,
    maxSpots: outing.maxSpots,
    participantCount,
    spotsLeft: outing.maxSpots - participantCount,
    isParticipant: outing.participants.some((p) => p.userId === dto.userId),
    createdBy: outing.user,
    participants: outing.participants.map((p) => p.user),
  };
}

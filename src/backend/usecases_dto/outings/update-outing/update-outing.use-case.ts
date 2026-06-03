import { prisma } from "@/backend/lib/prisma";
import { UpdateOutingDtoIn, UpdateOutingDtoOut } from "./update-outing.dto";

export async function updateOuting(dto: UpdateOutingDtoIn): Promise<UpdateOutingDtoOut> {
  const outing = await prisma.outing.findUnique({
    where: { id: dto.outingId },
    include: { _count: { select: { participants: true } } },
  });
  if (!outing) throw new Error("OUTING_NOT_FOUND");
  if (outing.userId !== dto.userId) throw new Error("NOT_OWNER");

  const updated = await prisma.outing.update({
    where: { id: dto.outingId },
    data: {
      title:    dto.title,
      date:     dto.date,
      location: dto.location,
      maxSpots: dto.maxSpots,
    },
    include: { _count: { select: { participants: true } } },
  });

  return {
    id:               updated.id,
    title:            updated.title,
    date:             updated.date,
    location:         updated.location,
    maxSpots:         updated.maxSpots,
    participantCount: updated._count.participants,
  };
}

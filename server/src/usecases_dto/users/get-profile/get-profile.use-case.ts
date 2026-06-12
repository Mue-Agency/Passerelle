import { prisma } from "../../../lib/prisma";
import type { GetProfileDtoIn, GetProfileDtoOut } from "./get-profile.dto";

export async function getProfile(dto: GetProfileDtoIn): Promise<GetProfileDtoOut> {
  const user = await prisma.user.findUnique({
    where: { id: dto.targetId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      interests: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  const [memberships, participations, proposedOutings] = await Promise.all([
    prisma.groupMember.findMany({
      where: { userId: dto.targetId },
      select: { joinedAt: true, group: { select: { name: true } } },
      orderBy: { joinedAt: "desc" },
      take: 20,
    }),
    prisma.outingParticipant.findMany({
      where: { userId: dto.targetId, status: "ACCEPTED" },
      select: { joinedAt: true, outing: { select: { title: true } } },
      orderBy: { joinedAt: "desc" },
      take: 20,
    }),
    prisma.outing.findMany({
      where: { userId: dto.targetId },
      select: { title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const activity: GetProfileDtoOut["activity"] = [];

  for (const m of memberships) {
    activity.push({
      type: "JOIN",
      label: `A rejoint le groupe ${m.group.name}`,
      date: m.joinedAt,
    });
  }

  for (const p of participations) {
    activity.push({
      type: "PARTICIPATION",
      label: `A participé à ${p.outing.title}`,
      date: p.joinedAt,
    });
  }

  for (const o of proposedOutings) {
    activity.push({
      type: "PROPOSED",
      label: `A proposé ${o.title}`,
      date: o.createdAt,
    });
  }

  activity.sort((a, b) => b.date.getTime() - a.date.getTime());

  return { ...user, activity: activity.slice(0, 20) };
}

import { prisma } from "../../../lib/prisma";
import type { ListGroupsDtoOut } from "./list-groups.dto";

export async function listGroups(): Promise<ListGroupsDtoOut> {
  const baseGroups = await prisma.group.findMany({
    where: { baseGroupId: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true } },
      sessions: {
        include: { _count: { select: { members: true } } },
      },
    },
  });

  return baseGroups.map((g) => {
    const sessionMembers = g.sessions.reduce(
      (sum, s) => sum + s._count.members,
      0,
    );
    return {
      id: g.id,
      name: g.name,
      lieu: g.lieu,
      maxMembers: g.maxMembers,
      createdAt: g.createdAt,
      sessionCount: 1 + g.sessions.length,
      totalMembers: g._count.members + sessionMembers,
    };
  });
}

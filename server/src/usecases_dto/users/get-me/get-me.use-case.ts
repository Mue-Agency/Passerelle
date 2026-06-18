import { prisma } from "../../../lib/prisma";
import type { GetMeDtoIn, GetMeDtoOut } from "./get-me.dto";

export async function getMe(dto: GetMeDtoIn): Promise<GetMeDtoOut> {
  const user = await prisma.user.findUnique({
    where: { id: dto.userId },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, interests: true, createdAt: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  return user;
}

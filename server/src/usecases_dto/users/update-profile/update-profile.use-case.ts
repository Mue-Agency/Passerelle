import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import type { UpdateProfileDtoIn, UpdateProfileDtoOut } from "./update-profile.dto";

export async function updateProfile(dto: UpdateProfileDtoIn): Promise<UpdateProfileDtoOut> {
  const data: Prisma.UserUpdateInput = {};
  if (dto.firstName !== undefined) data.firstName = dto.firstName;
  if (dto.lastName !== undefined) data.lastName = dto.lastName;
  if (dto.interests !== undefined) data.interests = dto.interests;

  const user = await prisma.user.update({
    where: { id: dto.userId },
    data,
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, interests: true },
  });

  return user;
}

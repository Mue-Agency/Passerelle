import { CreateProfileDtoIn, CreateProfileDtoOut } from "./create-profile.dto";
import {prisma} from "@/backend/lib/prisma";

export async function createProfile(dto: CreateProfileDtoIn): Promise<CreateProfileDtoOut> {
  const group = await prisma.group.findUnique({ where: { id: dto.groupId } });

  if (!group) {
    throw new Error("GROUP_NOT_FOUND");
  }

  const user = await prisma.user.create({
    data: {
      firstName: dto.firstName,
      lastName:  dto.lastName,
      memberships: {
        create: { groupId: dto.groupId },
      },
    },
  });

  return {
    userId:    user.id,
    firstName: user.firstName,
    lastName:  user.lastName,
    groupId:   dto.groupId,
  };
}

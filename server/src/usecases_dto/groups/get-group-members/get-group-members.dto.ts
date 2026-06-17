import { z } from "zod";

export const GetGroupMembersDtoIn = z.object({
  groupId: z.string().min(1),
  userId:  z.string().min(1),
});

export type GetGroupMembersDtoIn = z.output<typeof GetGroupMembersDtoIn>;

export const GetGroupMembersDtoOut = z.object({
  members: z.array(z.object({
    id:        z.string(),
    firstName: z.string(),
    lastName:  z.string(),
    avatarUrl: z.string().nullable(),
  })),
});

export type GetGroupMembersDtoOut = z.output<typeof GetGroupMembersDtoOut>;

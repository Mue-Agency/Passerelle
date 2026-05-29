import { z } from "zod";

export const GetGroupDtoIn = z.object({
  groupId: z.string().cuid(),
});

export type GetGroupDtoIn = z.output<typeof GetGroupDtoIn>;

export const GetGroupDtoOut = z.object({
  id:          z.string(),
  name:        z.string(),
  memberCount: z.number(),
  createdAt:   z.date(),
});

export type GetGroupDtoOut = z.output<typeof GetGroupDtoOut>;

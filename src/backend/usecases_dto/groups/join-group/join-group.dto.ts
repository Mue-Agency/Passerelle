import { z } from "zod";

export const JoinGroupDtoIn = z.object({
  groupId: z.string().min(1),
  userId:  z.string().cuid(),
});

export type JoinGroupDtoIn = z.output<typeof JoinGroupDtoIn>;

export const JoinGroupDtoOut = z.object({
  groupId:  z.string(),
  userId:   z.string(),
  joinedAt: z.date(),
});

export type JoinGroupDtoOut = z.output<typeof JoinGroupDtoOut>;

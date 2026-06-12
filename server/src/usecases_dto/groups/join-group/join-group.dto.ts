import { z } from "zod";

export const JoinGroupDtoIn = z.object({
  userId:  z.string().min(1),
  groupId: z.string().min(1),
});

export type JoinGroupDtoIn = z.output<typeof JoinGroupDtoIn>;

export const JoinGroupDtoOut = z.object({
  id:            z.string(),
  userId:        z.string(),
  groupId:       z.string(),
  sessionNumber: z.number(),
  joinedAt:      z.date(),
});

export type JoinGroupDtoOut = z.output<typeof JoinGroupDtoOut>;

import { z } from "zod";

export const JoinOutingDtoIn = z.object({
  outingId: z.string().cuid(),
  userId:   z.string().cuid(),
});

export type JoinOutingDtoIn = z.output<typeof JoinOutingDtoIn>;

export const JoinOutingDtoOut = z.object({
  outingId:         z.string(),
  userId:           z.string(),
  participantCount: z.number(),
  spotsLeft:        z.number(),
});

export type JoinOutingDtoOut = z.output<typeof JoinOutingDtoOut>;

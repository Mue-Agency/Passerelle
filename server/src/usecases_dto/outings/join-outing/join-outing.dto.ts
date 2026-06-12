import { z } from "zod";

export const JoinOutingDtoIn = z.object({
  outingId: z.string().min(1),
  userId:   z.string().min(1),
});

export type JoinOutingDtoIn = z.output<typeof JoinOutingDtoIn>;

export const JoinOutingDtoOut = z.object({
  participantCount: z.number(),
  groupId:          z.string(),
  outing: z.object({
    id:       z.string(),
    title:    z.string(),
    date:     z.date(),
    location: z.string(),
    maxSpots: z.number(),
  }),
});

export type JoinOutingDtoOut = z.output<typeof JoinOutingDtoOut>;

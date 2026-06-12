import { z } from "zod";

export const LeaveOutingDtoIn = z.object({
  outingId: z.string().min(1),
  userId:   z.string().min(1),
});

export type LeaveOutingDtoIn = z.output<typeof LeaveOutingDtoIn>;

export const LeaveOutingDtoOut = z.object({
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

export type LeaveOutingDtoOut = z.output<typeof LeaveOutingDtoOut>;

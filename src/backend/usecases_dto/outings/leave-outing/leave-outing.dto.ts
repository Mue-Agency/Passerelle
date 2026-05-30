import { z } from "zod";

export const LeaveOutingDtoIn = z.object({
  outingId: z.string().cuid(),
  userId:   z.string().cuid(),
});

export type LeaveOutingDtoIn = z.output<typeof LeaveOutingDtoIn>;

export const LeaveOutingDtoOut = z.object({
  outingId:         z.string(),
  userId:           z.string(),
  participantCount: z.number(),
  spotsLeft:        z.number(),
});

export type LeaveOutingDtoOut = z.output<typeof LeaveOutingDtoOut>;

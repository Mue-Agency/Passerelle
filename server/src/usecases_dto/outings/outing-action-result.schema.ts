import { z } from "zod";

export const OutingActionResult = z.object({
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

export type OutingActionResult = z.output<typeof OutingActionResult>;

import { z } from "zod";

export const MessageOut = z.object({
  id:      z.string(),
  type:    z.enum(["TEXT", "OUTING"]),
  content: z.string().nullable(),
  sentAt:  z.date(),
  user: z.object({
    id:        z.string(),
    firstName: z.string(),
    lastName:  z.string(),
  }),
  outing: z.object({
    id:               z.string(),
    title:            z.string(),
    date:             z.date(),
    location:         z.string(),
    maxSpots:         z.number(),
    participantCount: z.number(),
  }).nullable(),
});

export type MessageOut = z.output<typeof MessageOut>;

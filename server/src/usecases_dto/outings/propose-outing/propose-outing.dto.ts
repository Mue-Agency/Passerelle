import { z } from "zod";

export const ProposeOutingDtoIn = z.object({
  groupId:     z.string().min(1),
  userId:      z.string().min(1),
  title:       z.string().min(1).max(120),
  date:        z.string().min(1),
  location:    z.string().min(1).max(120),
  maxSpots:    z.number().int().positive().max(1000).optional(),
  recurring:   z.boolean().optional(),
  pollOptions: z.array(z.string().min(1).max(120)).max(20).optional(),
});

export type ProposeOutingDtoIn = z.output<typeof ProposeOutingDtoIn>;

export const ProposeOutingDtoOut = z.object({
  id:      z.string(),
  type:    z.enum(["TEXT", "OUTING", "JOIN"]),
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
    maxSpots:                z.number(),
    participantCount:        z.number(),
    participantCountrefused: z.number(),
    isParticipant:           z.boolean(),
  }),
});

export type ProposeOutingDtoOut = z.output<typeof ProposeOutingDtoOut>;

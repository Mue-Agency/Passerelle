import { z } from "zod";

export const ProposeOutingDtoIn = z.object({
  groupId:     z.string().min(1),
  userId:      z.string().min(1),
  title:       z.string().min(1),
  date:        z.string().min(1),
  location:    z.string().min(1),
  maxSpots:    z.number().int().positive().optional(),
  recurring:   z.boolean().optional(),
  pollOptions: z.array(z.string().min(1)).optional(),
});

export type ProposeOutingDtoIn = z.output<typeof ProposeOutingDtoIn>;

export const ProposeOutingDtoOut = z.object({
  id:      z.string(),
  type:    z.string(),
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
    isParticipant:    z.boolean(),
  }),
});

export type ProposeOutingDtoOut = z.output<typeof ProposeOutingDtoOut>;

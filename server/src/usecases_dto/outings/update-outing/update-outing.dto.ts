import { z } from "zod";

export const UpdateOutingDtoIn = z.object({
  outingId: z.string().min(1),
  userId:   z.string().min(1),
  title:    z.string().min(1).max(120),
  date:     z.string().min(1),
  location: z.string().min(1).max(120),
  maxSpots: z.number().int().positive().max(1000),
});

export type UpdateOutingDtoIn = z.output<typeof UpdateOutingDtoIn>;

export const UpdateOutingDtoOut = z.object({
  id:               z.string(),
  title:            z.string(),
  date:             z.date(),
  location:         z.string(),
  maxSpots:         z.number(),
  participantCount: z.number(),
  groupId:          z.string(),
});

export type UpdateOutingDtoOut = z.output<typeof UpdateOutingDtoOut>;

import { z } from "zod";

export const UpdateOutingDtoIn = z.object({
  outingId: z.string().cuid(),
  userId:   z.string().cuid(),
  title:    z.string().min(1).max(100),
  date:     z.coerce.date(),
  location: z.string().min(1).max(200),
  maxSpots: z.number().int().min(2).max(20),
});

export type UpdateOutingDtoIn = z.output<typeof UpdateOutingDtoIn>;

export const UpdateOutingDtoOut = z.object({
  id:               z.string(),
  title:            z.string(),
  date:             z.date(),
  location:         z.string(),
  maxSpots:         z.number(),
  participantCount: z.number(),
});

export type UpdateOutingDtoOut = z.output<typeof UpdateOutingDtoOut>;

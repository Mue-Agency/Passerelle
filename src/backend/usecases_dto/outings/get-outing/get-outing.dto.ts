import { z } from "zod";

export const GetOutingDtoIn = z.object({
  outingId: z.string().cuid(),
  userId:   z.string().cuid(),
});

export type GetOutingDtoIn = z.output<typeof GetOutingDtoIn>;

export const GetOutingDtoOut = z.object({
  id:               z.string(),
  title:            z.string(),
  date:             z.date(),
  location:         z.string(),
  maxSpots:         z.number(),
  participantCount: z.number(),
  spotsLeft:        z.number(),
  isParticipant:    z.boolean(),
  createdBy: z.object({
    id:        z.string(),
    firstName: z.string(),
    lastName:  z.string(),
  }),
  participants: z.array(z.object({
    id:        z.string(),
    firstName: z.string(),
    lastName:  z.string(),
  })),
});

export type GetOutingDtoOut = z.output<typeof GetOutingDtoOut>;

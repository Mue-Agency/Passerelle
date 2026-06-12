import { z } from "zod";

export const GetProfileDtoIn = z.object({
  userId:    z.string().min(1),
  targetId:  z.string().min(1),
});

export type GetProfileDtoIn = z.output<typeof GetProfileDtoIn>;

export const GetProfileDtoOut = z.object({
  id:        z.string(),
  firstName: z.string(),
  lastName:  z.string(),
  avatarUrl: z.string().nullable(),
  interests: z.array(z.string()),
  createdAt: z.date(),
  activity:  z.array(z.object({
    type: z.string(),
    label: z.string(),
    date: z.date(),
  })),
});

export type GetProfileDtoOut = z.output<typeof GetProfileDtoOut>;
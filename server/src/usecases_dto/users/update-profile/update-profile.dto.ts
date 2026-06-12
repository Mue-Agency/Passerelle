import { z } from "zod";

export const UpdateProfileDtoIn = z.object({
  userId:    z.string().min(1),
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
  interests: z.array(z.string().min(1).max(30)).max(10).optional(),
});

export type UpdateProfileDtoIn = z.output<typeof UpdateProfileDtoIn>;

export const UpdateProfileDtoOut = z.object({
  id:        z.string(),
  firstName: z.string(),
  lastName:  z.string(),
  avatarUrl: z.string().nullable(),
  interests: z.array(z.string()),
});

export type UpdateProfileDtoOut = z.output<typeof UpdateProfileDtoOut>;
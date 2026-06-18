import { z } from "zod";

export const GetMeDtoIn = z.object({
  userId: z.string().min(1),
});

export type GetMeDtoIn = z.output<typeof GetMeDtoIn>;

export const GetMeDtoOut = z.object({
  id:        z.string(),
  firstName: z.string(),
  lastName:  z.string(),
  avatarUrl: z.string().nullable(),
  interests: z.array(z.string()),
  createdAt: z.date(),
});

export type GetMeDtoOut = z.output<typeof GetMeDtoOut>;

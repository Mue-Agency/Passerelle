import { z } from "zod";

export const CreateProfileDtoIn = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  groupId:   z.string().min(1),
});

export type CreateProfileDtoIn = z.output<typeof CreateProfileDtoIn>;

export const CreateProfileDtoOut = z.object({
  userId:    z.string(),
  firstName: z.string(),
  lastName:  z.string(),
  groupId:   z.string(),
});

export type CreateProfileDtoOut = z.output<typeof CreateProfileDtoOut>;

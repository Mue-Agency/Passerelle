import { z } from "zod";

export const LoginDtoIn = z.object({
  firstName: z.string().min(1),
  password:  z.string().min(1),
});

export type LoginDtoIn = z.output<typeof LoginDtoIn>;

export const LoginDtoOut = z.object({
  userId:   z.string(),
  username: z.string(),
  role:     z.string(),
});

export type LoginDtoOut = z.output<typeof LoginDtoOut>;

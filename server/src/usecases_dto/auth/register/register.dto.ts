import { z } from "zod";

export const RegisterDtoIn = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  password:  z.string().min(6),
  groupId:   z.string().min(1).optional(),
});

export type RegisterDtoIn = z.output<typeof RegisterDtoIn>;

export const RegisterDtoOut = z.object({
  userId:   z.string(),
  username: z.string(),
  role:     z.enum(["CITOYEN", "ADMIN"]),
  groupId:  z.string().optional(),
});

export type RegisterDtoOut = z.output<typeof RegisterDtoOut>;

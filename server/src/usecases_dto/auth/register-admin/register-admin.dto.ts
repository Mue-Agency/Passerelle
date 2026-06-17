import { z } from "zod";

export const RegisterAdminDtoIn = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  password:  z.string().min(6),
  secret:    z.string().min(1),
});

export type RegisterAdminDtoIn = z.output<typeof RegisterAdminDtoIn>;

export const RegisterAdminDtoOut = z.object({
  userId:    z.string(),
  username:  z.string(),
  firstName: z.string(),
  role:      z.enum(["CITOYEN", "ADMIN"]),
});

export type RegisterAdminDtoOut = z.output<typeof RegisterAdminDtoOut>;

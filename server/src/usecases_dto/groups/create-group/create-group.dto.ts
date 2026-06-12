import { z } from "zod";

export const CreateGroupDtoIn = z.object({
  name: z.string().min(1).max(100),
  lieu: z.string().min(1).max(200),
});

export type CreateGroupDtoIn = z.output<typeof CreateGroupDtoIn>;

export const CreateGroupDtoOut = z.object({
  id:            z.string(),
  name:          z.string(),
  lieu:          z.string(),
  maxMembers:    z.number(),
  sessionNumber: z.number(),
  createdAt:     z.date(),
});

export type CreateGroupDtoOut = z.output<typeof CreateGroupDtoOut>;

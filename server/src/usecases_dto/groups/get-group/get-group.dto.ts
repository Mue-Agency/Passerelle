import { z } from "zod";

export const GetGroupDtoIn = z.object({
  groupId: z.string().min(1),
});

export type GetGroupDtoIn = z.output<typeof GetGroupDtoIn>;

export const GetGroupDtoOut = z.object({
  id:   z.string(),
  name: z.string(),
  lieu: z.string(),
});

export type GetGroupDtoOut = z.output<typeof GetGroupDtoOut>;

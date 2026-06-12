import { z } from "zod";

export const RefuseOutingDtoIn = z.object({
  outingId: z.string().min(1),
  userId:   z.string().min(1),
});

export type RefuseOutingDtoIn = z.output<typeof RefuseOutingDtoIn>;

export const RefuseOutingDtoOut = z.object({
  acceptedCount: z.number(),
  refusedCount:  z.number(),
  groupId:       z.string(),
});

export type RefuseOutingDtoOut = z.output<typeof RefuseOutingDtoOut>;
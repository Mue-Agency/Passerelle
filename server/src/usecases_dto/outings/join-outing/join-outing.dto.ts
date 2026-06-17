import { z } from "zod";
import { OutingActionResult } from "../outing-action-result.schema";

export const JoinOutingDtoIn = z.object({
  outingId: z.string().min(1),
  userId:   z.string().min(1),
});

export type JoinOutingDtoIn = z.output<typeof JoinOutingDtoIn>;

export const JoinOutingDtoOut = OutingActionResult;

export type JoinOutingDtoOut = z.output<typeof JoinOutingDtoOut>;

import { z } from "zod";
import { OutingActionResult } from "../outing-action-result.schema";

export const LeaveOutingDtoIn = z.object({
  outingId: z.string().min(1),
  userId:   z.string().min(1),
});

export type LeaveOutingDtoIn = z.output<typeof LeaveOutingDtoIn>;

export const LeaveOutingDtoOut = OutingActionResult;

export type LeaveOutingDtoOut = z.output<typeof LeaveOutingDtoOut>;

import { z } from "zod";
import { MessageOut } from "../message.schema";

export const GetMessagesDtoIn = z.object({
  groupId: z.string().min(1),
  userId:  z.string().min(1),
  cursor:  z.string().optional(),
  take:    z.number().int().positive().max(100).optional(),
});

export type GetMessagesDtoIn = z.output<typeof GetMessagesDtoIn>;

export const GetMessagesDtoOut = z.array(MessageOut);

export type GetMessagesDtoOut = z.output<typeof GetMessagesDtoOut>;

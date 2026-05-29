import { z } from "zod";
import { MessageOut } from "../message.schema";

export const SendMessageDtoIn = z.object({
  groupId: z.string().cuid(),
  userId:  z.string().cuid(),
  content: z.string().min(1).max(1000),
});

export type SendMessageDtoIn = z.output<typeof SendMessageDtoIn>;

export const SendMessageDtoOut = MessageOut;

export type SendMessageDtoOut = z.output<typeof SendMessageDtoOut>;

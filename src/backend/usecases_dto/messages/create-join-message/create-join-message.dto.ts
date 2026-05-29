import { z } from "zod";
import { MessageOut } from "../message.schema";

export const CreateJoinMessageDtoIn = z.object({
  userId:  z.string().min(1),
  groupId: z.string().min(1),
});

export type CreateJoinMessageDtoIn = z.output<typeof CreateJoinMessageDtoIn>;

export const CreateJoinMessageDtoOut = MessageOut;

export type CreateJoinMessageDtoOut = z.output<typeof CreateJoinMessageDtoOut>;

import { z } from "zod";
import { MessageOut } from "@/backend/usecases_dto/messages/message.schema";

export const ProposeOutingDtoIn = z.object({
  groupId:  z.string().cuid(),
  userId:   z.string().cuid(),
  title:    z.string().min(1).max(100),
  date:     z.coerce.date(),
  location: z.string().min(1).max(200),
  maxSpots: z.number().int().min(2).max(20).default(3),
});

export type ProposeOutingDtoIn = z.output<typeof ProposeOutingDtoIn>;

export const ProposeOutingDtoOut = MessageOut;

export type ProposeOutingDtoOut = z.output<typeof ProposeOutingDtoOut>;

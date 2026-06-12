import { z } from "zod";

export const VotePollDtoIn = z.object({
  optionId: z.string().min(1),
  userId:   z.string().min(1),
});

export type VotePollDtoIn = z.output<typeof VotePollDtoIn>;

export const VotePollDtoOut = z.object({
  optionId:  z.string(),
  voteCount: z.number(),
});

export type VotePollDtoOut = z.output<typeof VotePollDtoOut>;
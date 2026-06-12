import { z } from "zod";

export const ListGroupsDtoOut = z.array(
  z.object({
    id:           z.string(),
    name:         z.string(),
    lieu:         z.string(),
    maxMembers:   z.number(),
    createdAt:    z.date(),
    sessionCount: z.number(),
    totalMembers: z.number(),
  }),
);

export type ListGroupsDtoOut = z.output<typeof ListGroupsDtoOut>;

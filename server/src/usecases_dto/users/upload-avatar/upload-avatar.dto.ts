import { z } from "zod";

export const UploadAvatarDtoIn = z.object({
  userId: z.string().min(1),
});

export type UploadAvatarDtoIn = z.output<typeof UploadAvatarDtoIn>;

export const UploadAvatarDtoOut = z.object({
  avatarUrl: z.string(),
});

export type UploadAvatarDtoOut = z.output<typeof UploadAvatarDtoOut>;

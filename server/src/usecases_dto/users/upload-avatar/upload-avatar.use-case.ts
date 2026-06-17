import path from "path";
import fs from "fs";
import { fromBuffer } from "file-type";
import { prisma } from "../../../lib/prisma";
import type { UploadAvatarDtoIn, UploadAvatarDtoOut } from "./upload-avatar.dto";

const UPLOADS_DIR = path.resolve(__dirname, "../../../../uploads");
const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export async function uploadAvatar(
  dto: UploadAvatarDtoIn,
  buffer: Buffer,
): Promise<UploadAvatarDtoOut> {
  if (buffer.length > MAX_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const fileTypeResult = await fromBuffer(buffer);
  if (!fileTypeResult || !ALLOWED_MIMES.includes(fileTypeResult.mime)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const filename = `${dto.userId}.${fileTypeResult.ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  fs.writeFileSync(filepath, buffer);

  const avatarUrl = `/uploads/${filename}`;
  await prisma.user.update({
    where: { id: dto.userId },
    data: { avatarUrl },
  });

  return { avatarUrl };
}

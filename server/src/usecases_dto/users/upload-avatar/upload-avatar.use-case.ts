import path from "path";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { fromBuffer } from "file-type";
import { prisma } from "../../../lib/prisma";
import type { UploadAvatarDtoIn, UploadAvatarDtoOut } from "./upload-avatar.dto";

const UPLOADS_DIR = path.resolve(__dirname, "../../../../uploads");
const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export async function uploadAvatar(
  dto: UploadAvatarDtoIn,
  buffer: Buffer,
): Promise<UploadAvatarDtoOut> {
  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const fileType = await fromBuffer(buffer);
  if (!fileType || !ALLOWED_MIMES.includes(fileType.mime)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const filename = `${dto.userId}.${fileType.ext}`;

  // Supprime un éventuel avatar précédent d'extension différente (sinon fichier orphelin).
  const existingFiles = await readdir(UPLOADS_DIR);
  await Promise.all(
    existingFiles
      .filter((name) => name.startsWith(`${dto.userId}.`) && name !== filename)
      .map((name) => unlink(path.join(UPLOADS_DIR, name))),
  );

  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  const avatarUrl = `/uploads/${filename}`;
  await prisma.user.update({
    where: { id: dto.userId },
    data: { avatarUrl },
  });

  return { avatarUrl };
}
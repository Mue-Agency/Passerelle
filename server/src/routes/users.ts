import { Router } from "express";
import path from "path";
import fs from "fs";
import { verifyToken } from "../lib/auth";
import { requireAuth } from "../lib/authMiddleware";
import { getMe, updateProfile, UpdateProfileDtoIn, getProfile } from "../usecases_dto/users";
import { prisma } from "../lib/prisma";

export const usersRouter = Router();

usersRouter.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ exists: false });
    return;
  }

  const userId = verifyToken(header.slice(7));
  if (!userId) {
    res.status(401).json({ exists: false });
    return;
  }

  try {
    const user = await getMe({ userId });
    res.json({ exists: true, user });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      res.status(404).json({ exists: false });
      return;
    }
    res.status(500).json({ exists: false });
  }
});

usersRouter.patch("/me", requireAuth, async (req, res) => {
  const parsed = UpdateProfileDtoIn.safeParse({
    userId: req.userId!,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    interests: req.body.interests,
  });

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const user = await updateProfile(parsed.data);
    res.json(user);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

usersRouter.post("/me/avatar", requireAuth, async (req, res) => {
  if (!req.headers["content-type"]?.startsWith("image/")) {
    res.status(400).json({ error: "Le corps doit être une image (Content-Type: image/*)." });
    return;
  }

  const ext = req.headers["content-type"].split("/")[1]?.split(";")[0] || "png";
  const allowed = ["png", "jpeg", "jpg", "webp"];
  if (!allowed.includes(ext)) {
    res.status(400).json({ error: "Format non supporté. Utilisez PNG, JPEG ou WebP." });
    return;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  const MAX_SIZE = 2 * 1024 * 1024;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_SIZE) {
      res.status(413).json({ error: "Image trop volumineuse (2 Mo max)." });
      return;
    }
    chunks.push(chunk);
  }

  const filename = `${req.userId!}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  fs.writeFileSync(filepath, Buffer.concat(chunks));

  const avatarUrl = `/uploads/${filename}`;
  await prisma.user.update({
    where: { id: req.userId! },
    data: { avatarUrl },
  });

  res.json({ avatarUrl });
});

usersRouter.get("/:userId/profile", requireAuth, async (req, res) => {
  try {
    const profile = await getProfile({
      userId: req.userId!,
      targetId: req.params.userId,
    });
    res.json(profile);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      res.status(404).json({ error: "Utilisateur introuvable." });
      return;
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});
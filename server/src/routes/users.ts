import { Router } from "express";
import { requireAuth } from "../lib/authMiddleware";
import { getMe, updateProfile, UpdateProfileDtoIn, getProfile, uploadAvatar } from "../usecases_dto/users";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await getMe({ userId: req.userId! });
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

usersRouter.post("/me/avatar", requireAuth, async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  try {
    const result = await uploadAvatar({ userId: req.userId! }, Buffer.concat(chunks));
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "FILE_TOO_LARGE") {
        res.status(413).json({ error: "Image trop volumineuse (2 Mo max)." });
        return;
      }
      if (err.message === "INVALID_FILE_TYPE") {
        res.status(400).json({ error: "Le contenu du fichier n'est pas une image valide." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

usersRouter.get("/:userId/profile", requireAuth, async (req, res) => {
  try {
    const profile = await getProfile({
      userId: req.userId!,
      targetId: req.params.userId as string,
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
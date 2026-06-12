import { Router } from "express";
import { createToken } from "../lib/auth";
import {
  register, RegisterDtoIn,
  registerAdmin, RegisterAdminDtoIn,
  login, LoginDtoIn,
} from "../usecases_dto/auth";
import { createJoinMessage } from "../usecases_dto/messages";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = RegisterDtoIn.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await register(parsed.data);
    const token = createToken(result.userId);

    if (result.groupId) {
      try {
        const joinMsg = await createJoinMessage({
          groupId: result.groupId,
          userId: result.userId,
        });
        const io = req.app.get("io");
        io.to(`group:${result.groupId}`).emit("new-message", joinMsg);
      } catch {}
    }

    res.status(201).json({
      userId: result.userId,
      username: result.username,
      role: result.role,
      token,
    });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

authRouter.post("/register-admin", async (req, res) => {
  const parsed = RegisterAdminDtoIn.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await registerAdmin(parsed.data);
    const token = createToken(result.userId);

    res.status(201).json({
      userId: result.userId,
      username: result.username,
      role: result.role,
      token,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "INVALID_SECRET") {
      res.status(403).json({ error: "Secret invalide." });
      return;
    }
    console.error("[POST /api/auth/register-admin]", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = LoginDtoIn.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await login(parsed.data);
    const token = createToken(result.userId);

    res.json({
      userId: result.userId,
      username: result.username,
      role: result.role,
      token,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "Identifiants incorrects." });
      return;
    }
    console.error("[POST /api/auth/login]", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

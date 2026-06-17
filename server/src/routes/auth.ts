import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createToken } from "../lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, clearSessionCookieOptions } from "../lib/cookies";
import {
  register, RegisterDtoIn,
  registerAdmin, RegisterAdminDtoIn,
  login, LoginDtoIn,
} from "../usecases_dto/auth";
import { createJoinMessage } from "../usecases_dto/messages";
import { prisma } from "../lib/prisma";

export const authRouter = Router();

// Logout : doit toujours réussir (placé avant le rate-limiter).
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, clearSessionCookieOptions());
  res.json({ ok: true });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
});

authRouter.use(authLimiter);

authRouter.post("/register", async (req, res) => {
  const parsed = RegisterDtoIn.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await register(parsed.data);
    const token = createToken(result.userId);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());

    if (result.groupId) {
      try {
        const joinMsg = await createJoinMessage({
          groupId: result.groupId,
          userId: result.userId,
        });
        const io = req.app.get("io");
        io.to(`group:${result.groupId}`).emit("new-message", joinMsg);
      } catch (e) { console.error("[joinMessage]", e); }
    }

    res.status(201).json({
      userId: result.userId,
      username: result.username,
      role: result.role,
      groupId: result.groupId,
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
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());

    res.status(201).json({
      userId: result.userId,
      username: result.username,
      firstName: result.firstName,
      role: result.role,
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
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());

    let groupId: string | undefined;
    if (req.query.app === "front") {
      const membership = await prisma.groupMember.findFirst({
        where: { userId: result.userId },
        select: { groupId: true },
      });
      groupId = membership?.groupId;
    }

    res.json({
      userId: result.userId,
      username: result.username,
      firstName: result.firstName,
      role: result.role,
      ...(groupId && { groupId }),
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

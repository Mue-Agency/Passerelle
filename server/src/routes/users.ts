import { Router } from "express";
import { prisma } from "../lib/prisma";
import { createToken, verifyToken } from "../lib/auth";

export const usersRouter = Router();

usersRouter.post("/", async (req, res) => {
  const { firstName, lastName, groupId } = req.body;

  if (!firstName || !lastName || !groupId) {
    res.status(400).json({ error: "Données invalides." });
    return;
  }

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { firstName, lastName },
      });

      await tx.groupMember.create({
        data: { userId: user.id, groupId },
      });

      return { userId: user.id, groupId };
    });

    try {
      const joinMsg = await prisma.message.create({
        data: { groupId, userId: result.userId, type: "JOIN" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      const io = req.app.get("io");
      io.to(`group:${groupId}`).emit("new-message", {
        id: joinMsg.id,
        type: joinMsg.type,
        content: joinMsg.content,
        sentAt: joinMsg.sentAt,
        user: joinMsg.user,
        outing: null,
      });
    } catch {}

    const token = createToken(result.userId);

    res.status(201).json({ ...result, token });
  } catch (err) {
    console.error("[POST /api/users]", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      res.status(404).json({ exists: false });
      return;
    }

    res.json({ exists: true, user });
  } catch {
    res.status(500).json({ exists: false });
  }
});

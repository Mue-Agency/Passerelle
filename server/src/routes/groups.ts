import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../lib/authMiddleware";

export const groupsRouter = Router();

groupsRouter.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId as string;

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." });
      return;
    }

    res.json(group);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

groupsRouter.post("/:groupId/join", requireAuth, async (req, res) => {
  const groupId = req.params.groupId as string;
  const userId = req.userId!;

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." });
      return;
    }

    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (existing) {
      res.status(409).json({ error: "Déjà membre du groupe." });
      return;
    }

    const member = await prisma.groupMember.create({
      data: { userId, groupId },
    });

    res.status(201).json(member);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

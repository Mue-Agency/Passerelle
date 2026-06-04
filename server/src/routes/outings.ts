import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../lib/authMiddleware";

export const outingsRouter = Router();

outingsRouter.use(requireAuth);

outingsRouter.post("/:groupId/propose", async (req, res) => {
  const groupId = req.params.groupId as string;
  const userId = req.userId!;

  const { title, date, location, maxSpots } = req.body;

  try {
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }

    const [outing, user] = await prisma.$transaction(async (tx) => {
      const outing = await tx.outing.create({
        data: {
          title,
          date: new Date(date),
          location,
          maxSpots: maxSpots ?? 3,
          groupId,
          userId,
        },
      });

      await tx.message.create({
        data: {
          groupId,
          userId,
          type: "OUTING",
          outingId: outing.id,
        },
      });

      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true },
      });

      return [outing, user];
    });

    const messageOut = {
      id: outing.id,
      type: "OUTING" as const,
      content: null,
      sentAt: new Date(),
      user,
      outing: {
        id: outing.id,
        title: outing.title,
        date: outing.date,
        location: outing.location,
        maxSpots: outing.maxSpots,
        participantCount: 0,
        isParticipant: false,
      },
    };

    const io = req.app.get("io");
    io.to(`group:${groupId}`).emit("new-message", messageOut);

    res.status(201).json(messageOut);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.get("/:outingId", async (req, res) => {
  const outingId = req.params.outingId as string;
  const userId = req.userId!;

  try {
    const outing = await prisma.outing.findUnique({
      where: { id: outingId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        participants: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!outing) {
      res.status(404).json({ error: "Sortie introuvable." });
      return;
    }

    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: outing.groupId } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }

    const participantCount = outing.participants.length;

    res.json({
      id: outing.id,
      title: outing.title,
      date: outing.date,
      location: outing.location,
      maxSpots: outing.maxSpots,
      participantCount,
      spotsLeft: outing.maxSpots - participantCount,
      isParticipant: outing.participants.some((p) => p.userId === userId),
      createdBy: outing.user,
      participants: outing.participants.map((p) => p.user),
    });
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.patch("/:outingId", async (req, res) => {
  const outingId = req.params.outingId as string;
  const userId = req.userId!;

  const { title, date, location, maxSpots } = req.body;

  try {
    const outing = await prisma.outing.findUnique({ where: { id: outingId } });
    if (!outing) {
      res.status(404).json({ error: "Sortie introuvable." });
      return;
    }
    if (outing.userId !== userId) {
      res.status(403).json({ error: "Seul le créateur peut modifier cette sortie." });
      return;
    }

    const updated = await prisma.outing.update({
      where: { id: outingId },
      data: {
        title,
        date: new Date(date),
        location,
        maxSpots,
      },
      include: { _count: { select: { participants: true } } },
    });

    const io = req.app.get("io");
    io.to(`group:${outing.groupId}`).emit("outing-updated", {
      id: updated.id,
      title: updated.title,
      date: updated.date,
      location: updated.location,
      maxSpots: updated.maxSpots,
      participantCount: updated._count.participants,
    });

    res.json({
      id: updated.id,
      title: updated.title,
      date: updated.date,
      location: updated.location,
      maxSpots: updated.maxSpots,
      participantCount: updated._count.participants,
    });
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.post("/:outingId/join", async (req, res) => {
  const outingId = req.params.outingId as string;
  const userId = req.userId!;

  try {
    const outing = await prisma.outing.findUnique({
      where: { id: outingId },
      include: { _count: { select: { participants: true } } },
    });
    if (!outing) {
      res.status(404).json({ error: "Sortie introuvable." });
      return;
    }

    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: outing.groupId } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }

    if (outing._count.participants >= outing.maxSpots) {
      res.status(409).json({ error: "Plus de places disponibles." });
      return;
    }

    const existing = await prisma.outingParticipant.findUnique({
      where: { outingId_userId: { outingId, userId } },
    });
    if (existing) {
      res.status(409).json({ error: "Vous participez déjà à cette sortie." });
      return;
    }

    await prisma.outingParticipant.create({
      data: { outingId, userId },
    });

    const newCount = outing._count.participants + 1;

    const io = req.app.get("io");
    io.to(`group:${outing.groupId}`).emit("outing-updated", {
      id: outing.id,
      title: outing.title,
      date: outing.date,
      location: outing.location,
      maxSpots: outing.maxSpots,
      participantCount: newCount,
    });

    res.status(201).json({ participantCount: newCount });
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.delete("/:outingId/join", async (req, res) => {
  const outingId = req.params.outingId as string;
  const userId = req.userId!;

  try {
    const outing = await prisma.outing.findUnique({
      where: { id: outingId },
      include: { _count: { select: { participants: true } } },
    });
    if (!outing) {
      res.status(404).json({ error: "Sortie introuvable." });
      return;
    }

    const existing = await prisma.outingParticipant.findUnique({
      where: { outingId_userId: { outingId, userId } },
    });
    if (!existing) {
      res.status(409).json({ error: "Vous ne participez pas à cette sortie." });
      return;
    }

    await prisma.outingParticipant.delete({
      where: { outingId_userId: { outingId, userId } },
    });

    const newCount = outing._count.participants - 1;

    const io = req.app.get("io");
    io.to(`group:${outing.groupId}`).emit("outing-updated", {
      id: outing.id,
      title: outing.title,
      date: outing.date,
      location: outing.location,
      maxSpots: outing.maxSpots,
      participantCount: newCount,
    });

    res.json({ participantCount: newCount });
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../lib/authMiddleware";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId as string;
  const userId = req.userId!;

  try {
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { groupId },
      orderBy: { sentAt: "asc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        outing: {
          include: {
            _count: { select: { participants: true } },
            participants: { select: { userId: true } },
          },
        },
      },
    });

    res.json(messages.map((msg) => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      sentAt: msg.sentAt,
      user: msg.user,
      outing: msg.outing
        ? {
            id: msg.outing.id,
            title: msg.outing.title,
            date: msg.outing.date,
            location: msg.outing.location,
            maxSpots: msg.outing.maxSpots,
            participantCount: msg.outing._count.participants,
            isParticipant: msg.outing.participants.some((p) => p.userId === userId),
          }
        : null,
    })));
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

messagesRouter.post("/:groupId", async (req, res) => {
  const groupId = req.params.groupId as string;
  const userId = req.userId!;

  const { content } = req.body;
  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "Contenu invalide." });
    return;
  }

  try {
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }

    const message = await prisma.message.create({
      data: { groupId, userId, content, type: "TEXT" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const messageOut = {
      id: message.id,
      type: message.type,
      content: message.content,
      sentAt: message.sentAt,
      user: message.user,
      outing: null,
    };

    const io = req.app.get("io");
    io.to(`group:${groupId}`).emit("new-message", messageOut);

    res.status(201).json(messageOut);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

import { Router } from "express";
import { requireAuth } from "../lib/authMiddleware";
import { getMessages, sendMessage, SendMessageDtoIn } from "../usecases_dto/messages";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.get("/:groupId", async (req, res) => {
  try {
    const result = await getMessages({
      groupId: req.params.groupId,
      userId: req.userId!,
    });
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_MEMBER") {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

messagesRouter.post("/:groupId", async (req, res) => {
  const parsed = SendMessageDtoIn.safeParse({
    groupId: req.params.groupId,
    userId: req.userId!,
    content: req.body.content,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Contenu invalide." });
    return;
  }

  try {
    const result = await sendMessage(parsed.data);

    const io = req.app.get("io");
    io.to(`group:${req.params.groupId}`).emit("new-message", result);

    res.status(201).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_MEMBER") {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

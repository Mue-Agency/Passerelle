import { Router } from "express";
import { requireAuth } from "../lib/authMiddleware";
import {
  proposeOuting,
  getOuting,
  updateOuting,
  joinOuting,
  leaveOuting,
  refuseOuting,
  votePoll,
} from "../usecases_dto/outings";

export const outingsRouter = Router();

outingsRouter.use(requireAuth);

outingsRouter.post("/:groupId/propose", async (req, res) => {
  try {
    const result = await proposeOuting({
      groupId: req.params.groupId,
      userId: req.userId!,
      title: req.body.title,
      date: req.body.date,
      location: req.body.location,
      maxSpots: req.body.maxSpots,
      recurring: req.body.recurring,
      pollOptions: req.body.pollOptions,
    });

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

outingsRouter.get("/:outingId", async (req, res) => {
  try {
    const result = await getOuting({
      outingId: req.params.outingId,
      userId: req.userId!,
    });
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") {
        res.status(404).json({ error: "Sortie introuvable." });
        return;
      }
      if (err.message === "NOT_MEMBER") {
        res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.patch("/:outingId", async (req, res) => {
  try {
    const result = await updateOuting({
      outingId: req.params.outingId,
      userId: req.userId!,
      title: req.body.title,
      date: req.body.date,
      location: req.body.location,
      maxSpots: req.body.maxSpots,
    });

    const io = req.app.get("io");
    io.to(`group:${result.groupId}`).emit("outing-updated", {
      id: result.id,
      title: result.title,
      date: result.date,
      location: result.location,
      maxSpots: result.maxSpots,
      participantCount: result.participantCount,
    });

    res.json({
      id: result.id,
      title: result.title,
      date: result.date,
      location: result.location,
      maxSpots: result.maxSpots,
      participantCount: result.participantCount,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") {
        res.status(404).json({ error: "Sortie introuvable." });
        return;
      }
      if (err.message === "NOT_OWNER") {
        res.status(403).json({ error: "Seul le créateur peut modifier cette sortie." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.post("/:outingId/join", async (req, res) => {
  try {
    const result = await joinOuting({
      outingId: req.params.outingId,
      userId: req.userId!,
    });

    const io = req.app.get("io");
    io.to(`group:${result.groupId}`).emit("outing-updated", {
      id: result.outing.id,
      title: result.outing.title,
      date: result.outing.date,
      location: result.outing.location,
      maxSpots: result.outing.maxSpots,
      participantCount: result.participantCount,
    });

    res.status(201).json({ participantCount: result.participantCount });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") {
        res.status(404).json({ error: "Sortie introuvable." });
        return;
      }
      if (err.message === "NOT_MEMBER") {
        res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
        return;
      }
      if (err.message === "NO_SPOTS_LEFT") {
        res.status(409).json({ error: "Plus de places disponibles." });
        return;
      }
      if (err.message === "ALREADY_PARTICIPANT") {
        res.status(409).json({ error: "Vous participez déjà à cette sortie." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.delete("/:outingId/join", async (req, res) => {
  try {
    const result = await leaveOuting({
      outingId: req.params.outingId,
      userId: req.userId!,
    });

    const io = req.app.get("io");
    io.to(`group:${result.groupId}`).emit("outing-updated", {
      id: result.outing.id,
      title: result.outing.title,
      date: result.outing.date,
      location: result.outing.location,
      maxSpots: result.outing.maxSpots,
      participantCount: result.participantCount,
    });

    res.json({ participantCount: result.participantCount });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") {
        res.status(404).json({ error: "Sortie introuvable." });
        return;
      }
      if (err.message === "NOT_PARTICIPANT") {
        res.status(409).json({ error: "Vous ne participez pas à cette sortie." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.post("/:outingId/refuse", async (req, res) => {
  try {
    const result = await refuseOuting({
      outingId: req.params.outingId,
      userId: req.userId!,
    });

    const io = req.app.get("io");
    io.to(`group:${result.groupId}`).emit("outing-updated", {
      outingId: req.params.outingId,
      acceptedCount: result.acceptedCount,
      refusedCount: result.refusedCount,
    });

    res.json({ acceptedCount: result.acceptedCount, refusedCount: result.refusedCount });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") {
        res.status(404).json({ error: "Sortie introuvable." });
        return;
      }
      if (err.message === "NOT_MEMBER") {
        res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
        return;
      }
      if (err.message === "ALREADY_REFUSED") {
        res.status(409).json({ error: "Vous avez déjà refusé cette sortie." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

outingsRouter.post("/poll/:optionId/vote", async (req, res) => {
  try {
    const result = await votePoll({
      optionId: req.params.optionId,
      userId: req.userId!,
    });
    res.status(201).json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "OPTION_NOT_FOUND") {
        res.status(404).json({ error: "Option introuvable." });
        return;
      }
      if (err.message === "NOT_MEMBER") {
        res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
        return;
      }
      if (err.message === "ALREADY_VOTED") {
        res.status(409).json({ error: "Vous avez déjà voté pour cette option." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

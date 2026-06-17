import { Router } from "express";
import { requireAuth, requireAdmin } from "../lib/authMiddleware";
import { prisma } from "../lib/prisma";
import {
  getGroup,
  joinGroup,
  createGroup,
  CreateGroupDtoIn,
  listGroups,
  getGroupMembers,
} from "../usecases_dto/groups";

export const groupsRouter = Router();

groupsRouter.get("/", requireAdmin, async (_req, res) => {
  try {
    const result = await listGroups();
    res.json(result);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

groupsRouter.post("/", requireAdmin, async (req, res) => {
  const parsed = CreateGroupDtoIn.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  try {
    const result = await createGroup(parsed.data);
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

groupsRouter.get("/:groupId", requireAuth, async (req, res) => {
  try {
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.userId!, groupId: req.params.groupId as string } },
    });
    if (!member) {
      res.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
      return;
    }

    const result = await getGroup({ groupId: req.params.groupId as string });
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "GROUP_NOT_FOUND") {
      res.status(404).json({ error: "Groupe introuvable." });
      return;
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

groupsRouter.get("/:groupId/members", requireAuth, async (req, res, next) => {
  try {
    const result = await getGroupMembers({
      groupId: req.params.groupId as string,
      userId: req.userId!,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

groupsRouter.post("/:groupId/join", requireAuth, async (req, res) => {
  try {
    const result = await joinGroup({
      userId: req.userId!,
      groupId: req.params.groupId as string,
    });
    res.status(201).json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "GROUP_NOT_FOUND") {
        res.status(404).json({ error: "Groupe introuvable." });
        return;
      }
      if (err.message === "ALREADY_MEMBER") {
        res.status(409).json({ error: "Déjà membre du groupe." });
        return;
      }
    }
    res.status(500).json({ error: "Erreur serveur." });
  }
});

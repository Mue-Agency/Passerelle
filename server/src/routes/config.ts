import { Router } from "express";
import { requireAuth } from "../lib/authMiddleware";
import { LIEU, DEFAULT_GROUP_ID } from "../lib/constants";

export const configRouter = Router();

configRouter.get("/", requireAuth, (_req, res) => {
  res.json({ lieu: LIEU, groupId: DEFAULT_GROUP_ID });
});

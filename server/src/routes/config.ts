import { Router } from "express";
import { LIEU, DEFAULT_GROUP_ID } from "../lib/constants";

export const configRouter = Router();

configRouter.get("/", (_req, res) => {
  res.json({ lieu: LIEU, groupId: DEFAULT_GROUP_ID });
});

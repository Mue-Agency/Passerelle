import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }

  const userId = verifyToken(header.slice(7));
  if (!userId) {
    res.status(401).json({ error: "Token invalide." });
    return;
  }

  req.userId = userId;
  next();
}

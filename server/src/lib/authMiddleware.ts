import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth";
import { SESSION_COOKIE } from "./cookies";
import { prisma } from "./prisma";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Source principale : cookie httpOnly. Fallback Bearer transitoire (rollout) — à retirer ensuite.
  const cookieToken = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }

  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ error: "Token invalide." });
    return;
  }

  req.userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, async () => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ error: "Accès réservé aux administrateurs." });
      return;
    }

    next();
  });
}

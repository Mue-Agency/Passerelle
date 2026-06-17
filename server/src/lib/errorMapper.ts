import type { Request, Response, NextFunction } from "express";

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  GROUP_NOT_FOUND:    { status: 404, message: "Groupe introuvable." },
  OUTING_NOT_FOUND:   { status: 404, message: "Sortie introuvable." },
  USER_NOT_FOUND:     { status: 404, message: "Utilisateur introuvable." },
  OPTION_NOT_FOUND:   { status: 404, message: "Option introuvable." },
  NOT_MEMBER:         { status: 403, message: "Vous n'êtes pas membre de ce groupe." },
  NOT_OWNER:          { status: 403, message: "Seul le créateur peut modifier cette sortie." },
  INVALID_CREDENTIALS:{ status: 401, message: "Identifiants incorrects." },
  INVALID_SECRET:     { status: 403, message: "Secret invalide." },
  ALREADY_MEMBER:     { status: 409, message: "Déjà membre du groupe." },
  ALREADY_PARTICIPANT:{ status: 409, message: "Vous participez déjà à cette sortie." },
  ALREADY_REFUSED:    { status: 409, message: "Vous avez déjà refusé cette sortie." },
  ALREADY_VOTED:      { status: 409, message: "Vous avez déjà voté pour cette option." },
  NOT_PARTICIPANT:    { status: 409, message: "Vous ne participez pas à cette sortie." },
  NO_SPOTS_LEFT:      { status: 409, message: "Plus de places disponibles." },
};

export function errorMapper(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Error && err.message in ERROR_MAP) {
    const mapped = ERROR_MAP[err.message];
    res.status(mapped.status).json({ error: mapped.message });
    return;
  }
  console.error("[Unhandled]", err);
  res.status(500).json({ error: "Erreur serveur." });
}

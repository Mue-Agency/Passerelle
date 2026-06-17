const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL manquante : configurez-la dans dash/.env.local.",
  );
}

export type Result<T> =
  | { isOk: true; data: T }
  | { isOk: false; error: string };

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function logout(): Promise<void> {
  await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

async function handleResponse<T>(res: Response, path: string): Promise<Result<T>> {
  // Session invalide/expirée sur une route protégée : on efface le cookie et on renvoie à la connexion.
  // On exclut /api/auth/* : un 401 sur /login = mauvais identifiants, pas une session expirée.
  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !path.startsWith("/api/auth/")
  ) {
    await logout();
    window.location.href = "/connexion";
    return { isOk: false, error: "Session expirée, reconnectez-vous." };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { isOk: false, error: body?.error ?? "Erreur serveur" };
  }

  const data = (await res.json()) as T;
  return { isOk: true, data };
}

export async function request<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(apiUrl(path), { ...init, credentials: "include" });
    return handleResponse<T>(res, path);
  } catch {
    return { isOk: false, error: "Impossible de joindre le serveur." };
  }
}

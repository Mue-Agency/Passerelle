const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function handleResponse<T>(
  res: Response,
): Promise<{ isOk: true; data: T } | { isOk: false; error: string }> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { isOk: false, error: body?.error ?? "Erreur serveur" };
  }
  const data = (await res.json()) as T;
  return { isOk: true, data };
}

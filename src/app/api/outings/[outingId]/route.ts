import { cookies } from "next/headers";
import { getOuting, GetOutingDtoIn } from "@/backend/usecases_dto/outings";

export async function GET(_req: Request, { params }: { params: Promise<{ outingId: string }> }) {
  const { outingId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = GetOutingDtoIn.safeParse({ outingId, userId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await getOuting(parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") return Response.json({ error: "Sortie introuvable." }, { status: 404 });
      if (err.message === "NOT_MEMBER")       return Response.json({ error: "Vous n'êtes pas membre de ce groupe." }, { status: 403 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

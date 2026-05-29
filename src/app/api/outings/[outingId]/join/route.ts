import { cookies } from "next/headers";
import { joinOuting, JoinOutingDtoIn } from "@/backend/usecases_dto/outings";

export async function POST(_req: Request, { params }: { params: Promise<{ outingId: string }> }) {
  const { outingId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = JoinOutingDtoIn.safeParse({ outingId, userId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await joinOuting(parsed.data);
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND")    return Response.json({ error: "Sortie introuvable." }, { status: 404 });
      if (err.message === "NOT_MEMBER")          return Response.json({ error: "Vous n'êtes pas membre de ce groupe." }, { status: 403 });
      if (err.message === "OUTING_FULL")         return Response.json({ error: "Plus de places disponibles." }, { status: 409 });
      if (err.message === "ALREADY_PARTICIPANT") return Response.json({ error: "Vous participez déjà à cette sortie." }, { status: 409 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getOuting, GetOutingDtoIn, updateOuting, UpdateOutingDtoIn } from "@/backend/usecases_dto/outings";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ outingId: string }> }) {
  const { outingId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateOutingDtoIn.safeParse({ ...body, outingId, userId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await updateOuting(parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "OUTING_NOT_FOUND") return Response.json({ error: "Sortie introuvable." }, { status: 404 });
      if (err.message === "NOT_OWNER")        return Response.json({ error: "Seul le créateur peut modifier cette sortie." }, { status: 403 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

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

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { proposeOuting, ProposeOutingDtoIn } from "@/backend/usecases_dto/outings";

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = ProposeOutingDtoIn.safeParse({ ...body, userId, groupId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await proposeOuting(parsed.data);
    return Response.json(message, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_MEMBER") {
      return Response.json({ error: "Vous n'êtes pas membre de ce groupe." }, { status: 403 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

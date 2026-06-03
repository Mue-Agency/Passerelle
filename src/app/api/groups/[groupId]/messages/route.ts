import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getMessages, GetMessagesDtoIn, sendMessage, SendMessageDtoIn } from "@/backend/usecases_dto/messages";

export async function GET(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = GetMessagesDtoIn.safeParse({ groupId, userId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await getMessages(parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_MEMBER") {
      return Response.json({ error: "Vous n'êtes pas membre de ce groupe." }, { status: 403 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = SendMessageDtoIn.safeParse({ ...body, userId, groupId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await sendMessage(parsed.data);
    return Response.json(message, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_MEMBER") {
      return Response.json({ error: "Vous n'êtes pas membre de ce groupe." }, { status: 403 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

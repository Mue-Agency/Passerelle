import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createProfile, CreateProfileDtoIn } from "@/backend/usecases_dto/users";
import { createJoinMessage } from "@/backend/usecases_dto/messages";
import { eventBus } from "@/backend/lib/event-bus";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProfileDtoIn.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Données invalides." }, { status: 400 });
  }

  try {
    const result = await createProfile(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set("userId", result.userId, {
      httpOnly: true,
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 30,
    });

    try {
      const joinMessage = await createJoinMessage({ userId: result.userId, groupId: result.groupId });
      eventBus.emit(`group:${result.groupId}`, joinMessage);
    } catch {}

    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "GROUP_NOT_FOUND") {
      return Response.json({ error: "Groupe introuvable." }, { status: 404 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

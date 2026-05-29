import { cookies } from "next/headers";
import { joinGroup, JoinGroupDtoIn } from "@/backend/usecases_dto/groups";

export async function POST(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  const parsed = JoinGroupDtoIn.safeParse({ userId, groupId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await joinGroup(parsed.data);
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "GROUP_NOT_FOUND") return Response.json({ error: "Groupe introuvable." }, { status: 404 });
      if (err.message === "USER_NOT_FOUND")  return Response.json({ error: "Utilisateur introuvable." }, { status: 404 });
      if (err.message === "ALREADY_MEMBER")  return Response.json({ error: "Déjà membre du groupe." }, { status: 409 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

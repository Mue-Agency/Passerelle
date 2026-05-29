import { getGroup, GetGroupDtoIn } from "@/backend/usecases_dto/groups";

export async function GET(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const parsed = GetGroupDtoIn.safeParse({ groupId });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await getGroup(parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "GROUP_NOT_FOUND") {
      return Response.json({ error: "Groupe introuvable." }, { status: 404 });
    }
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

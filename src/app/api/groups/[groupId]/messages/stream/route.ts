import { cookies } from "next/headers";
import { prisma } from "@/backend/lib/prisma";
import { eventBus } from "@/backend/lib/event-bus";
import type { MessageOut } from "@/backend/usecases_dto/messages";

export async function GET(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!member) return Response.json({ error: "Vous n'êtes pas membre de ce groupe." }, { status: 403 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: MessageOut) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      eventBus.on(`group:${groupId}`, send);

      req.signal.addEventListener("abort", () => {
        eventBus.off(`group:${groupId}`, send);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}

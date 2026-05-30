import { cookies } from "next/headers";
import { prisma } from "@/backend/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json({ exists: false }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return Response.json({ exists: false }, { status: 404 });
    }

    return Response.json({ exists: true, user });
  } catch {
    return Response.json({ exists: false }, { status: 500 });
  }
}

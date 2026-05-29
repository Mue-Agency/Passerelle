import { LIEU, DEFAULT_GROUP_ID } from "@/backend/lib/constants";

export async function GET() {
  return Response.json({
    lieu:    LIEU,
    groupId: DEFAULT_GROUP_ID,
  });
}

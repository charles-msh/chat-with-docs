import { NextRequest } from "next/server";
import { incrementUsage } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const { groupId } = await request.json();
  if (!groupId || typeof groupId !== "string") {
    return Response.json({ error: "groupId required" }, { status: 400 });
  }
  await incrementUsage(groupId);
  return Response.json({ ok: true });
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadUserGroups, saveUserGroups, StoredGroup } from "@/lib/redis";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const kakaoId = (session?.user as { kakaoId?: string })?.kakaoId;
  if (!kakaoId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const groups = await loadUserGroups(kakaoId);
  return Response.json({ groups });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const kakaoId = (session?.user as { kakaoId?: string })?.kakaoId;
  if (!kakaoId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { groups } = (await request.json()) as { groups: StoredGroup[] };
  if (!Array.isArray(groups)) {
    return Response.json({ error: "groups 배열이 필요합니다." }, { status: 400 });
  }

  await saveUserGroups(kakaoId, groups);
  return Response.json({ ok: true });
}

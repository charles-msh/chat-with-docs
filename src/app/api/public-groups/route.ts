import { NextRequest } from "next/server";
import { loadPublicGroups, savePublicGroups, getWeeklyStats, type PublicGroupData } from "@/lib/redis";

export async function GET() {
  const groups = await loadPublicGroups();
  const groupIds = groups.map((g) => g.id);
  const stats = await getWeeklyStats(groupIds);

  const withStats = groups.map((g) => ({
    ...g,
    weeklyUsage: stats[g.id] || 0,
  }));

  return Response.json({ groups: withStats });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, group } = body;

  if (action === "add" && group) {
    const groups = await loadPublicGroups();
    const newGroup: PublicGroupData = {
      id: `pub-${Date.now()}`,
      name: group.name,
      description: group.description || "",
      emoji: group.emoji || "📄",
      category: group.category || "일반",
      urls: group.urls || [],
      isFeatured: group.isFeatured || false,
      featuredOrder: group.featuredOrder || 0,
      createdAt: new Date().toISOString(),
    };
    groups.push(newGroup);
    await savePublicGroups(groups);
    return Response.json({ ok: true, group: newGroup });
  }

  if (action === "update" && group?.id) {
    const groups = await loadPublicGroups();
    const idx = groups.findIndex((g) => g.id === group.id);
    if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
    groups[idx] = { ...groups[idx], ...group };
    await savePublicGroups(groups);
    return Response.json({ ok: true });
  }

  if (action === "delete" && body.id) {
    const groups = await loadPublicGroups();
    await savePublicGroups(groups.filter((g) => g.id !== body.id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "invalid action" }, { status: 400 });
}

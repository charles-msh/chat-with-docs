import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return redis;
}

export interface StoredGroup {
  id: string;
  name: string;
  urls: string[];
  fileNames: string[];
}

const userKey = (kakaoId: string) => `chatdocs:user:${kakaoId}`;

export async function loadUserGroups(kakaoId: string): Promise<StoredGroup[] | null> {
  const r = getRedis();
  if (!r) return null;
  const data = await r.get<StoredGroup[]>(userKey(kakaoId));
  return data || null;
}

export async function saveUserGroups(kakaoId: string, groups: StoredGroup[]): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.set(userKey(kakaoId), groups);
}

// Public groups
const PUBLIC_GROUPS_KEY = "chatdocs:public:groups";

export interface PublicGroupData {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  urls: string[];
  isFeatured: boolean;
  featuredOrder: number;
  createdAt: string;
}

export async function loadPublicGroups(): Promise<PublicGroupData[]> {
  const r = getRedis();
  if (!r) return [];
  const data = await r.get<PublicGroupData[]>(PUBLIC_GROUPS_KEY);
  return data || [];
}

export async function savePublicGroups(groups: PublicGroupData[]): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.set(PUBLIC_GROUPS_KEY, groups);
}

// Usage stats
const statsKey = (groupId: string) => `chatdocs:stats:${groupId}`;
const weeklyStatsKey = (groupId: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `chatdocs:weekly:${year}:${week}:${groupId}`;
};

export async function incrementUsage(groupId: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await Promise.all([
    r.incr(statsKey(groupId)),
    r.incr(weeklyStatsKey(groupId)),
  ]);
}

export async function getWeeklyStats(groupIds: string[]): Promise<Record<string, number>> {
  const r = getRedis();
  if (!r) return {};
  const results: Record<string, number> = {};
  const keys = groupIds.map(weeklyStatsKey);
  const values = await Promise.all(keys.map((k) => r.get<number>(k)));
  groupIds.forEach((id, i) => {
    results[id] = values[i] || 0;
  });
  return results;
}

// Recent groups per user
const recentKey = (kakaoId: string) => `chatdocs:recent:${kakaoId}`;

export async function addRecentGroup(kakaoId: string, groupId: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const key = recentKey(kakaoId);
  const existing = await r.get<string[]>(key);
  const list = existing || [];
  const filtered = list.filter((id) => id !== groupId);
  filtered.unshift(groupId);
  await r.set(key, filtered.slice(0, 10));
}

export async function getRecentGroups(kakaoId: string): Promise<string[]> {
  const r = getRedis();
  if (!r) return [];
  const data = await r.get<string[]>(recentKey(kakaoId));
  return data || [];
}

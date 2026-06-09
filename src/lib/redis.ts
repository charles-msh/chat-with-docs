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

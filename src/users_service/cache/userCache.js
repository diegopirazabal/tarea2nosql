import { getRedisClient } from "../db/redis.js";

const TTL_SECONDS = 600;

export async function cacheUser(user) {
  if (!user || !user.id) {
    return;
  }
  const client = getRedisClient();
  await client.set(getKey(user.id), JSON.stringify(user), "EX", TTL_SECONDS);
}

export async function getCachedUser(userId) {
  const client = getRedisClient();
  const cached = await client.get(getKey(userId));
  if (!cached) {
    return null;
  }
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function getKey(userId) {
  return `user:${userId}`;
}

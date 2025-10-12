import Redis from "ioredis";

let redisClient;

export function createRedisClient(redisUrl) {
  if (!redisUrl) {
    throw new Error("La variable REDIS_URL es obligatoria para iniciar el servicio.");
  }

  redisClient = new Redis(redisUrl);

  redisClient.on("error", (error) => {
    console.error("Redis reportó un error:", error.message);
  });

  return redisClient;
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error("El cliente de Redis no está inicializado.");
  }
  return redisClient;
}

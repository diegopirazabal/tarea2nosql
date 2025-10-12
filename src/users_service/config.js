import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/eventflow_users_service",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

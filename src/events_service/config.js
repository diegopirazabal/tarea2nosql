import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3002,
  mongodbUri:
    process.env.EVENTS_MONGODB_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/eventflow_events_service",
};

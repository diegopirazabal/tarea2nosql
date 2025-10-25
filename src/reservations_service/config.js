import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3003,
  mongodbUri:
    process.env.RESERVATIONS_MONGODB_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/eventflow_reservations_service",
  usersBaseUrl: process.env.USERS_BASE_URL || "http://localhost:3001",
  eventsBaseUrl: process.env.EVENTS_BASE_URL || "http://localhost:3002",
  paymentSuccessRate: (() => {
    const raw = process.env.PAYMENT_SUCCESS_RATE;
    const num = raw ? Number(raw) : 1;
    return Number.isFinite(num) && num >= 0 && num <= 1 ? num : 1;
  })(),
};

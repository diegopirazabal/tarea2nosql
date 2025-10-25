import express from "express";
import { config } from "./config.js";
import { connectToMongo } from "./db/mongo.js";
import router from "./routes.js";

async function startServer() {
  try {
    await connectToMongo(config.mongodbUri);
    console.log("Conexión exitosa a MongoDB (reservas).");
  } catch (error) {
    console.error("No se pudo iniciar el servicio de reservas:", error.message);
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", router);

  app.use((err, _req, res, _next) => {
    console.error("Error inesperado en reservas:", err);
    res.status(500).json({ error: "Ocurrió un error interno." });
  });

  app.listen(config.port, () => {
    console.log(`Servicio de reservas listo en http://localhost:${config.port}`);
  });
}

startServer();


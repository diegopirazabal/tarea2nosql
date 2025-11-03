export const config = {
  port: Number(process.env.RESERVATIONS_PORT ?? process.env.PORT ?? 3003),
  mongodbUri:
    process.env.RESERVATIONS_MONGODB_URI ?? process.env.EVENTS_MONGODB_URI ?? "",
  payment: {
    acceptedMethods: ["tarjeta", "transferencia", "rechazar", "sin-fondos"],
  },
};

if (!config.mongodbUri) {
  throw new Error(
    "Se requiere la variable RESERVATIONS_MONGODB_URI (o EVENTS_MONGODB_URI) para iniciar el servicio de reservas."
  );
}

import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export async function connectToMongo(uri) {
  if (!uri) {
    throw new Error("La variable MONGODB_URI es obligatoria para iniciar el servicio.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

export { mongoose };

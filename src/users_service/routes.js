import { Router } from "express";
import { cacheUser, getCachedUser } from "./cache/userCache.js";
import { mongoose } from "./db/mongo.js";
import {
  createUser,
  findUserByDocument,
  findUserById,
} from "./repositories/userRepository.js";

const router = Router();

router.post("/usuarios", async (req, res, next) => {
  try {
    const {
      tipo_doc,
      nro_doc,
      nombre,
      apellido,
      email,
      fecha_nac,
    } = req.body ?? {};

    const validationErrors = validateUserPayload({
      tipo_doc,
      nro_doc,
      nombre,
      apellido,
      email,
      fecha_nac,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ errores: validationErrors });
    }

    const existing = await findUserByDocument(tipo_doc, nro_doc);
    if (existing) {
      return res.status(409).json({
        error:
          "Ya existe un usuario con el mismo tipo y número de documento.",
      });
    }

    const fechaNacDate = new Date(fecha_nac);

    const user = await createUser({
      tipo_doc,
      nro_doc,
      nombre,
      apellido,
      email,
      fecha_nac: fechaNacDate,
    });

    await cacheUser(user);

    return res.status(201).json(user);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        error:
          "Ya existe un usuario con el mismo tipo y número de documento.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

router.get("/usuarios/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "El identificador no es válido." });
    }

    const cached = await getCachedUser(id);
    if (cached) {
      return res.json({ ...cached, origen: "cache" });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    await cacheUser(user);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

function validateUserPayload({
  tipo_doc,
  nro_doc,
  nombre,
  apellido,
  email,
  fecha_nac,
}) {
  const errors = [];

  if (!isNonEmptyString(tipo_doc)) {
    errors.push("tipo_doc es obligatorio y debe ser una cadena.");
  }
  if (!isNonEmptyString(nro_doc)) {
    errors.push("nro_doc es obligatorio y debe ser una cadena.");
  }
  if (!isNonEmptyString(nombre)) {
    errors.push("nombre es obligatorio y debe ser una cadena.");
  }
  if (!isNonEmptyString(apellido)) {
    errors.push("apellido es obligatorio y debe ser una cadena.");
  }
  if (!isValidEmail(email)) {
    errors.push("email es obligatorio y debe tener un formato válido.");
  }
  if (!isValidDate(fecha_nac)) {
    errors.push("fecha_nac debe recibirse en formato ISO (YYYY-MM-DD).");
  }

  return errors;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  return typeof value === "string" && value.includes("@");
}

function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export default router;

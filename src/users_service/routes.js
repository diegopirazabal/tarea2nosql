import { Router } from "express";
import { cacheUser, getCachedUser } from "./cache/userCache.js";
import { mongoose } from "./db/mongo.js";
import {
  createUser,
  findAllUsers,
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

    const fechaNac = new Date(fecha_nac);

    const user = await createUser({
      tipo_doc,
      nro_doc,
      nombre,
      apellido,
      email,
      fecha_nac: fechaNac,
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

router.get("/usuarios/exportar", async (_req, res, next) => {
  try {
    const users = await findAllUsers();
    const csv = buildUsersCsv(users);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="usuarios.csv"');
    res.send(csv);
  } catch (error) {
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

function buildUsersCsv(users) {
  const headers = [
    "id",
    "tipo_doc",
    "nro_doc",
    "nombre",
    "apellido",
    "email",
    "fecha_nac",
    "created_at",
    "updated_at",
  ];

  const rows = users.map((user) =>
    headers
      .map((field) => formatCsvValue(user[field]))
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function formatCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  let stringValue = value;
  if (value instanceof Date) {
    stringValue = value.toISOString();
  } else if (typeof value === "object") {
    stringValue = JSON.stringify(value);
  } else {
    stringValue = String(value);
  }

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default router;

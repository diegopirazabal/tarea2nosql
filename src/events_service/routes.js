import { Router } from "express";
import { mongoose } from "./db/mongo.js";
import { createEvent, findEventById, reserveSeats, revertSeats } from "./repositories/eventRepository.js";

const router = Router();

router.post("/eventos", async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      fecha,
      lugar,
      aforo_total,
      aforo_disponible,
    } = req.body ?? {};

    const totalNumber = numberOrNull(aforo_total);
    const disponibleNumber = numberOrNull(aforo_disponible);

    const validationErrors = validateEventPayload({
      nombre,
      descripcion,
      fecha,
      lugar,
      aforo_total: totalNumber,
      aforo_disponible: disponibleNumber,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ errores: validationErrors });
    }

    const fechaEvento = new Date(fecha);
    const event = await createEvent({
      nombre,
      descripcion,
      fecha: fechaEvento,
      lugar,
      aforo_total: totalNumber,
      aforo_disponible: disponibleNumber,
    });

    return res.status(201).json(event);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

router.get("/eventos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "El identificador no es válido." });
    }

    const event = await findEventById(id);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado." });
    }

    return res.json(event);
  } catch (error) {
    return next(error);
  }
});

router.post("/eventos/:id/reservar", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "El identificador no es válido." });
    }
    const qty = numberOrNull(cantidad);
    if (qty === null || qty <= 0) {
      return res
        .status(400)
        .json({ error: "cantidad debe ser un número mayor a 0." });
    }

    const updated = await reserveSeats(id, qty);
    if (!updated) {
      return res.status(409).json({ error: "No hay aforo disponible suficiente." });
    }
    return res.json({ ok: true, evento: updated });
  } catch (error) {
    return next(error);
  }
});

router.post("/eventos/:id/revertir", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "El identificador no es válido." });
    }
    const qty = numberOrNull(cantidad);
    if (qty === null || qty <= 0) {
      return res
        .status(400)
        .json({ error: "cantidad debe ser un número mayor a 0." });
    }

    const updated = await revertSeats(id, qty);
    if (!updated) {
      return res.status(404).json({ error: "Evento no encontrado." });
    }
    return res.json({ ok: true, evento: updated });
  } catch (error) {
    return next(error);
  }
});

function validateEventPayload({
  nombre,
  descripcion,
  fecha,
  lugar,
  aforo_total,
  aforo_disponible,
}) {
  const errors = [];

  if (!isNonEmptyString(nombre)) {
    errors.push("nombre es obligatorio y debe ser una cadena.");
  }
  if (descripcion !== undefined && typeof descripcion !== "string") {
    errors.push("descripcion debe ser una cadena si se especifica.");
  }
  if (!isValidDate(fecha)) {
    errors.push("fecha es obligatoria y debe recibirse en formato ISO (YYYY-MM-DD).");
  }
  if (!isNonEmptyString(lugar)) {
    errors.push("lugar es obligatorio y debe ser una cadena.");
  }
  const totalNumber = numberOrNull(aforo_total);
  const disponibleNumber = numberOrNull(aforo_disponible);

  if (totalNumber === null || totalNumber < 0) {
    errors.push("aforo_total es obligatorio y debe ser un número mayor o igual a cero.");
  }
  if (disponibleNumber === null || disponibleNumber < 0) {
    errors.push(
      "aforo_disponible es obligatorio y debe ser un número mayor o igual a cero."
    );
  }
  if (
    errors.length === 0 &&
    totalNumber !== null &&
    disponibleNumber !== null &&
    disponibleNumber > totalNumber
  ) {
    errors.push("aforo_disponible no puede ser mayor que aforo_total.");
  }

  return errors;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function numberOrNull(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export default router;

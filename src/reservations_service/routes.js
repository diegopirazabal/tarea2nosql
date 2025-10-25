import { Router } from "express";
import { config } from "./config.js";
import { mongoose } from "./db/mongo.js";
import {
  createReservation,
  setReservationStatus,
  findReservationById,
} from "./repositories/reservationRepository.js";

const router = Router();

router.post("/reservar", async (req, res, next) => {
  try {
    const { user_id, event_id, cantidad } = req.body ?? {};

    const errors = validateReservationPayload({ user_id, event_id, cantidad });
    if (errors.length > 0) {
      return res.status(400).json({ errores: errors });
    }

    const reservation = await createReservation({ user_id, event_id, cantidad });

    // Chain Step 1: Verificar usuario existe
    const userOk = await checkUserExists(user_id);
    if (!userOk) {
      await setReservationStatus(reservation.id, "CANCELADA");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Chain Step 2: Intentar reservar cupos en eventos (operación atómica del servicio de eventos)
    const reserved = await callEventsReserve(event_id, cantidad);
    if (!reserved.ok) {
      await setReservationStatus(reservation.id, "CANCELADA");
      return res.status(409).json({ error: reserved.error || "No hay cupo disponible." });
    }

    // Chain Step 3: Procesar pago (mock)
    const pago = await mockPayment(user_id, event_id, cantidad);
    if (!pago.ok) {
      // compensación: revertir cupos
      await callEventsRevert(event_id, cantidad);
      await setReservationStatus(reservation.id, "CANCELADA");
      return res.status(402).json({ error: "Pago rechazado." });
    }

    const finalRes = await setReservationStatus(reservation.id, "CONFIRMADA", {
      pago_ref: pago.ref,
    });
    return res.status(201).json(finalRes);
  } catch (error) {
    return next(error);
  }
});

router.get("/reservas/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: "El identificador no es válido." });
    }
    const resv = await findReservationById(id);
    if (!resv) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    return res.json(resv);
  } catch (error) {
    return next(error);
  }
});

function validateReservationPayload({ user_id, event_id, cantidad }) {
  const errors = [];
  if (!isValidId(user_id)) errors.push("user_id inválido.");
  if (!isValidId(event_id)) errors.push("event_id inválido.");
  const qty = numberOrNull(cantidad);
  if (qty === null || qty <= 0) errors.push("cantidad debe ser un número mayor a 0.");
  return errors;
}

function isValidId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function numberOrNull(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function checkUserExists(userId) {
  const url = new URL(`/api/usuarios/${userId}`, config.usersBaseUrl).toString();
  const resp = await fetch(url);
  if (!resp.ok) return false;
  return true;
}

async function callEventsReserve(eventId, cantidad) {
  const url = new URL(`/api/eventos/${eventId}/reservar`, config.eventsBaseUrl).toString();
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad }),
  });
  if (resp.ok) return { ok: true };
  try {
    const data = await resp.json();
    return { ok: false, error: data?.error };
  } catch {
    return { ok: false };
  }
}

async function callEventsRevert(eventId, cantidad) {
  const url = new URL(`/api/eventos/${eventId}/revertir`, config.eventsBaseUrl).toString();
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad }),
  });
}

async function mockPayment(userId, eventId, cantidad) {
  // Simula un pago con probabilidad de éxito configurable
  const r = Math.random();
  const ok = r < config.paymentSuccessRate;
  return ok ? { ok: true, ref: `PAY-${Date.now()}` } : { ok: false };
}

export default router;

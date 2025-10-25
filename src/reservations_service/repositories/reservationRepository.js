import { ReservationModel } from "../models/reservationModel.js";

export async function createReservation({ user_id, event_id, cantidad }) {
  const reservation = new ReservationModel({ user_id, event_id, cantidad });
  await reservation.validate();
  await reservation.save();
  return reservation.toJSON();
}

export async function setReservationStatus(id, estado, extra = {}) {
  const updated = await ReservationModel.findByIdAndUpdate(
    id,
    { $set: { estado, ...extra } },
    { new: true }
  ).lean({ getters: true });
  if (!updated) return null;
  return formatReservation(updated);
}

export async function findReservationById(id) {
  const found = await ReservationModel.findById(id).lean({ getters: true });
  if (!found) return null;
  return formatReservation(found);
}

function formatReservation(doc) {
  if (!doc) return null;
  if (doc._id && !doc.id) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  return doc;
}


import {
  ReservationModel,
  RESERVATION_STATUS,
} from "../models/reservationModel.js";

export async function createPendingReservation({
  usuario_id,
  evento_id,
  cantidad,
  metodo_pago,
  total = 0,
}) {
  const reservation = new ReservationModel({
    usuario_id,
    evento_id,
    cantidad,
    metodo_pago,
    total,
    estado: RESERVATION_STATUS.PENDING,
  });
  await reservation.validate();
  await reservation.save();
  return reservation.toJSON();
}

export async function markReservationAsConfirmed(reservationId) {
  const updated = await ReservationModel.findByIdAndUpdate(
    reservationId,
    {
      estado: RESERVATION_STATUS.CONFIRMED,
      notas_compensacion: undefined,
    },
    {
      new: true,
      lean: true,
      getters: true,
    }
  );
  return formatReservation(updated);
}

export async function markReservationAsCancelled(
  reservationId,
  notas_compensacion
) {
  const updated = await ReservationModel.findByIdAndUpdate(
    reservationId,
    {
      estado: RESERVATION_STATUS.CANCELLED,
      notas_compensacion,
    },
    {
      new: true,
      lean: true,
      getters: true,
    }
  );
  return formatReservation(updated);
}

function formatReservation(reservation) {
  if (!reservation) {
    return null;
  }

  if (reservation._id && !reservation.id) {
    reservation.id = reservation._id.toString();
    delete reservation._id;
  }

  return reservation;
}

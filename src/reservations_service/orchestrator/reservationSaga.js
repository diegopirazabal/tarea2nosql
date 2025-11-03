import {
  createPendingReservation,
  markReservationAsCancelled,
  markReservationAsConfirmed,
} from "../repositories/reservationRepository.js";
import {
  reserveEventSeats,
  releaseEventSeats,
} from "../../events_service/repositories/eventRepository.js";
import { capturePayment } from "../services/paymentGateway.js";
import { InventoryError, PaymentError } from "../services/errors.js";

export class ReservationSagaOrchestrator {
  async execute(context) {
    const saga = {
      reservation: null,
      event: context.event,
      inventoryReserved: false,
      paymentResult: null,
      validated: context.validated,
    };

    try {
      await this.createReservation(saga);
      await this.reserveInventory(saga);
      await this.processPayment(saga);
      return await this.confirmReservation(saga);
    } catch (error) {
      await this.compensate(saga, error);
      throw error;
    }
  }

  async createReservation(saga) {
    const reservation = await createPendingReservation({
      usuario_id: saga.validated.usuario_id,
      evento_id: saga.validated.evento_id,
      cantidad: saga.validated.cantidad,
      metodo_pago: saga.validated.metodo_pago,
      total: saga.validated.cantidad,
    });
    saga.reservation = reservation;
  }

  async reserveInventory(saga) {
    const updatedEvent = await reserveEventSeats(
      saga.validated.evento_id,
      saga.validated.cantidad
    );
    if (!updatedEvent) {
      throw new InventoryError(
        "No se pudo reservar el aforo solicitado. Es posible que el cupo haya cambiado."
      );
    }
    saga.event = updatedEvent;
    saga.inventoryReserved = true;
  }

  async processPayment(saga) {
    const paymentResult = await capturePayment({
      metodo_pago: saga.validated.metodo_pago,
      monto: saga.validated.cantidad,
    });
    if (!paymentResult?.confirmado) {
      throw new PaymentError("El procesador de pagos no confirmó la transacción.");
    }
    saga.paymentResult = paymentResult;
  }

  async confirmReservation(saga) {
    const confirmed = await markReservationAsConfirmed(saga.reservation.id);
    return {
      reservation: confirmed,
      event: saga.event,
      payment: saga.paymentResult,
    };
  }

  async compensate(saga, originalError) {
    if (saga.inventoryReserved) {
      try {
        await releaseEventSeats(
          saga.validated.evento_id,
          saga.validated.cantidad
        );
      } catch (releaseError) {
        console.error(
          "Error al compensar la reserva de inventario:",
          releaseError
        );
      }
    }

    if (saga.reservation) {
      await markReservationAsCancelled(
        saga.reservation.id,
        `Motivo: ${originalError.message}`
      );
    }
  }
}

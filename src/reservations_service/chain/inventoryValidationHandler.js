import { BaseHandler } from "./baseHandler.js";
import { InventoryError } from "../services/errors.js";
import { findEventById } from "../../events_service/repositories/eventRepository.js";

export class InventoryValidationHandler extends BaseHandler {
  async handle(context) {
    const { evento_id, cantidad } = context.validated ?? {};

    const event = await findEventById(evento_id);
    if (!event) {
      throw new InventoryError("El evento indicado no existe.");
    }
    //no deberia pasar nunca
    if (typeof event.aforo_disponible !== "number") {
      throw new InventoryError("El evento no tiene aforo disponible configurado.");
    }

    if (event.aforo_disponible < cantidad) {
      throw new InventoryError("No hay suficiente aforo disponible para la cantidad solicitada.");
    }

    context.event = event;

    return super.handle(context);
  }
}

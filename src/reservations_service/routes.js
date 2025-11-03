import { Router } from "express";
import { ReservationSagaOrchestrator } from "./orchestrator/reservationSaga.js";
import { DataValidationHandler } from "./chain/dataValidationHandler.js";
import { InventoryValidationHandler } from "./chain/inventoryValidationHandler.js";
import { PaymentProcessorHandler } from "./chain/paymentProcessorHandler.js";
import {
  InventoryError,
  PaymentError,
  ValidationError,
} from "./services/errors.js";

const router = Router();
const orchestrator = new ReservationSagaOrchestrator();

router.post("/reservas", async (req, res, next) => {
  const context = { payload: req.body };

  const dataValidation = new DataValidationHandler();
  const inventoryValidation = dataValidation.setNext(
    new InventoryValidationHandler()
  );
  inventoryValidation.setNext(new PaymentProcessorHandler());

  try {
    await dataValidation.handle(context);
    const result = await orchestrator.execute(context);

    return res.status(201).json({
      reserva: result.reservation,
      evento: result.event,
      pago: result.payment,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: error.message,
        detalles: error.details,
      });
    }

    if (error instanceof InventoryError) {
      return res.status(409).json({
        error: error.message,
      });
    }

    if (error instanceof PaymentError) {
      return res.status(402).json({
        error: error.message,
      });
    }

    return next(error);
  }
});

export default router;

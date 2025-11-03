import { config } from "../config/index.js";
import { PaymentError } from "./errors.js";

const REJECTED_TOKEN = new Set(["rechazar"]);

export async function authorizePayment({ metodo_pago }) {
  const normalizedMethod = metodo_pago.toLowerCase();
  if (
    !config.payment.acceptedMethods
      .map((method) => method.toLowerCase())
      .includes(normalizedMethod)
  ) {
    throw new PaymentError("El método de pago no está soportado.");
  }
  if (REJECTED_TOKEN.has(normalizedMethod)) {
    throw new PaymentError("El método de pago fue rechazado por el gateway.");
  }
  return { autorizado: true };
}

export async function capturePayment({ metodo_pago, monto }) {
  if (REJECTED_TOKEN.has(metodo_pago.toLowerCase())) {
    throw new PaymentError("El pago fue rechazado por el gateway.");
  }

  // Simulación de confirmación inmediata.
  return { confirmado: true, monto };
}

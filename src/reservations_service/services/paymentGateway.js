import { config } from "../config/index.js";
import { PaymentError } from "./errors.js";

const REJECTED_TOKENS = new Map([
  ["rechazar", "El pago fue rechazado por el gateway."],
  ["sin-fondos", "El pago fue rechazado: fondos insuficientes."],
]);

export async function authorizePayment({ metodo_pago }) {
  const normalizedMethod = metodo_pago.toLowerCase();
  const accepted = config.payment.acceptedMethods.map((method) =>
    method.toLowerCase()
  );

  if (!accepted.includes(normalizedMethod)) {
    throw new PaymentError("El método de pago no está soportado.");
  }

  return { autorizado: true };
}

export async function capturePayment({ metodo_pago, monto }) {
  const normalizedMethod = metodo_pago.toLowerCase();
  if (REJECTED_TOKENS.has(normalizedMethod)) {
    throw new PaymentError(REJECTED_TOKENS.get(normalizedMethod));
  }

  // Simulación de confirmación inmediata.
  return { confirmado: true, monto };
}

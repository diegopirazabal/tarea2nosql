import { BaseHandler } from "./baseHandler.js";
import { authorizePayment } from "../services/paymentGateway.js";

export class PaymentProcessorHandler extends BaseHandler {
  async handle(context) {
    const { metodo_pago } = context.validated ?? {};

    const authorization = await authorizePayment({ metodo_pago });
    context.paymentAuthorization = authorization;

    return super.handle(context);
  }
}

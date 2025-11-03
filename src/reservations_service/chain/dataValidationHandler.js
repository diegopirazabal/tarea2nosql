import { BaseHandler } from "./baseHandler.js";
import { ValidationError } from "../services/errors.js";
import { mongoose } from "../db/mongo.js";

export class DataValidationHandler extends BaseHandler {
  async handle(context) {
    const {
      usuario_id,
      evento_id,
      cantidad,
      metodo_pago,
    } = context.payload ?? {};

    const errors = [];

    if (!isNonEmptyString(usuario_id)) {
      errors.push("usuario_id es obligatorio y debe ser una cadena.");
    }
    if (!isValidObjectId(evento_id)) {
      errors.push("evento_id es obligatorio y debe ser un ObjectId válido.");
    }
    if (!isPositiveInteger(cantidad)) {
      errors.push("cantidad es obligatoria y debe ser un número entero mayor que cero.");
    }
    if (!isNonEmptyString(metodo_pago)) {
      errors.push("metodo_pago es obligatorio y debe ser una cadena.");
    }

    if (errors.length > 0) {
      throw new ValidationError("La solicitud contiene datos inválidos.", errors);
    }

    context.validated = {
      usuario_id,
      evento_id,
      cantidad: Number(cantidad),
      metodo_pago,
    };

    return super.handle(context);
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function isPositiveInteger(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
  }
  return false;
}

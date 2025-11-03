export class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class InventoryError extends Error {
  constructor(message) {
    super(message);
    this.name = "InventoryError";
  }
}

export class PaymentError extends Error {
  constructor(message) {
    super(message);
    this.name = "PaymentError";
  }
}

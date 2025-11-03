import { mongoose } from "../db/mongo.js";

export const RESERVATION_STATUS = {
  PENDING: "pendiente",
  CONFIRMED: "confirmada",
  CANCELLED: "cancelada",
};

const reservationSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: String,
      required: true,
      trim: true,
    },
    evento_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, "La cantidad mínima de entradas es 1."],
    },
    metodo_pago: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.PENDING,
    },
    total: {
      type: Number,
      min: [0, "El total no puede ser negativo."],
    },
    notas_compensacion: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

reservationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const ReservationModel = mongoose.model(
  "Reservation",
  reservationSchema
);

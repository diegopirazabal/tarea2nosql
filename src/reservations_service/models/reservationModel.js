import { mongoose } from "../db/mongo.js";

const reservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, "La cantidad debe ser al menos 1."],
    },
    estado: {
      type: String,
      enum: ["CREADA", "CONFIRMADA", "CANCELADA"],
      default: "CREADA",
      required: true,
    },
    pago_ref: {
      type: String,
      default: null,
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

reservationSchema.index({ user_id: 1, event_id: 1, created_at: -1 });

export const ReservationModel = mongoose.model("Reservation", reservationSchema);


import { mongoose } from "../db/mongo.js";

const eventSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
      trim: true,
    },
    aforo_total: {
      type: Number,
      required: true,
      min: [0, "El aforo total no puede ser negativo."],
    },
    aforo_disponible: {
      type: Number,
      required: true,
      min: [0, "El aforo disponible no puede ser negativo."],
      validate: {
        validator(value) {
          return typeof this.aforo_total !== "number" || value <= this.aforo_total;
        },
        message: "El aforo disponible no puede superar el aforo total.",
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

eventSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const EventModel = mongoose.model("Event", eventSchema);

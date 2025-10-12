import { mongoose } from "../db/mongo.js";

const userSchema = new mongoose.Schema(
  {
    tipo_doc: {
      type: String,
      required: true,
      trim: true,
    },
    nro_doc: {
      type: String,
      required: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fecha_nac: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

userSchema.index({ tipo_doc: 1, nro_doc: 1 }, { unique: true });

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const UserModel = mongoose.model("User", userSchema);

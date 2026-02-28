import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password: string;
  // Role-specific fields (optional)
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  // Atlet-only fields
  category?: string;
  position?: string;
  height?: number;
  weight?: number;
  athleteId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Pelatih", "Atlet", "Ketua Klub"],
      default: "Atlet",
    },
    status: {
      type: String,
      required: true,
      enum: ["Aktif", "Non-Aktif", "Menunggu"],
      default: "Aktif",
    },
    password: { type: String, required: true },
    // Role-specific fields
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"] },
    address: { type: String, default: "" },
    // Atlet-only fields
    category: {
      type: String,
      enum: ["Pra Usia Dini", "Usia Dini", "Anak-anak", "Pemula", "Remaja", "Taruna", "Dewasa"],
    },
    position: {
      type: String,
      enum: ["Tunggal", "Ganda", "Keduanya"],
    },
    height: { type: Number },
    weight: { type: Number },
    athleteId: { type: Schema.Types.ObjectId, ref: "Athlete" },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

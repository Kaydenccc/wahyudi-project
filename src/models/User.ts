import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password: string;
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
      enum: ["Aktif", "Non-Aktif"],
      default: "Aktif",
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

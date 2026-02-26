import mongoose, { Schema, Document } from "mongoose";

export interface IClubSettings extends Document {
  clubName: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  logo: string;
  favicon: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSettingsSchema = new Schema<IClubSettings>(
  {
    clubName: { type: String, required: true, default: "B-Club Badminton" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ClubSettings =
  mongoose.models.ClubSettings ||
  mongoose.model<IClubSettings>("ClubSettings", ClubSettingsSchema);

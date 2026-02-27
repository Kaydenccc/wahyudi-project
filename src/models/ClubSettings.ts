import mongoose, { Schema, Document } from "mongoose";

export interface ISponsor {
  _id?: mongoose.Types.ObjectId;
  name: string;
  logo: string;
  website?: string;
}

export interface IClubSettings extends Document {
  clubName: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  logo: string;
  favicon: string;
  history: string;
  vision: string;
  mission: string;
  sponsors: ISponsor[];
  createdAt: Date;
  updatedAt: Date;
}

const ClubSettingsSchema = new Schema<IClubSettings>(
  {
    clubName: { type: String, required: true, default: "PB. TIGA BERLIAN" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    history: { type: String, default: "" },
    vision: { type: String, default: "" },
    mission: { type: String, default: "" },
    sponsors: [
      {
        name: { type: String, required: true },
        logo: { type: String, required: true },
        website: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export const ClubSettings =
  mongoose.models.ClubSettings ||
  mongoose.model<IClubSettings>("ClubSettings", ClubSettingsSchema);

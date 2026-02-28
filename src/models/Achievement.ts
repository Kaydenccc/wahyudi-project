import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  athlete: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  category: string;
  level: string;
  result: string;
  photo?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    athlete: { type: Schema.Types.ObjectId, ref: "Athlete", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Turnamen", "Kejuaraan", "Peringkat", "Lainnya"],
    },
    level: {
      type: String,
      required: true,
      enum: ["Daerah", "Nasional", "Internasional"],
    },
    result: {
      type: String,
      required: true,
      enum: ["Juara 1", "Juara 2", "Juara 3", "Partisipasi", "Lainnya"],
    },
    photo: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

AchievementSchema.index({ athlete: 1, date: -1 });
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ level: 1 });
AchievementSchema.index({ createdBy: 1 });

export const Achievement =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>("Achievement", AchievementSchema);

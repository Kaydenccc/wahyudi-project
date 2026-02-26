import mongoose, { Schema, Document } from "mongoose";

export interface IPerformanceStats {
  smashSpeed?: number;
  footworkRating?: number;
  winProbability?: number;
  netAccuracy?: number;
}

export interface IRecovery {
  overall?: number;
  sleepScore?: number;
  hrvStatus?: string;
}

export interface IPerformanceRecord extends Document {
  athlete: mongoose.Types.ObjectId;
  date: Date;
  score: number;
  type: string;
  stats: IPerformanceStats;
  recovery: IRecovery;
  trend: string;
  change: string;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceRecordSchema = new Schema<IPerformanceRecord>(
  {
    athlete: { type: Schema.Types.ObjectId, ref: "Athlete", required: true },
    date: { type: Date, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    type: { type: String, required: true, enum: ["Training", "Post-Match"] },
    stats: {
      smashSpeed: { type: Number },
      footworkRating: { type: Number },
      winProbability: { type: Number },
      netAccuracy: { type: Number },
    },
    recovery: {
      overall: { type: Number },
      sleepScore: { type: Number },
      hrvStatus: { type: String },
    },
    trend: { type: String, enum: ["up", "down", "neutral"], default: "neutral" },
    change: { type: String, default: "0%" },
  },
  { timestamps: true }
);

export const PerformanceRecord =
  mongoose.models.PerformanceRecord ||
  mongoose.model<IPerformanceRecord>("PerformanceRecord", PerformanceRecordSchema);

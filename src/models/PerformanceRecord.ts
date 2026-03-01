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
      smashSpeed: { type: Number, min: 0 },
      footworkRating: { type: Number, min: 0, max: 10 },
      winProbability: { type: Number, min: 0, max: 100 },
      netAccuracy: { type: Number, min: 0, max: 100 },
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

PerformanceRecordSchema.index({ athlete: 1, date: -1 });

export const PerformanceRecord =
  mongoose.models.PerformanceRecord ||
  mongoose.model<IPerformanceRecord>("PerformanceRecord", PerformanceRecordSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface ITrainingSchedule extends Document {
  program: mongoose.Types.ObjectId;
  date: Date;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
  coach: string;
  athletes: mongoose.Types.ObjectId[];
  status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingScheduleSchema = new Schema<ITrainingSchedule>(
  {
    program: { type: Schema.Types.ObjectId, ref: "TrainingProgram", required: true },
    date: { type: Date, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, required: true },
    coach: { type: String, required: true },
    athletes: [{ type: Schema.Types.ObjectId, ref: "Athlete" }],
    status: {
      type: String,
      required: true,
      enum: ["Selesai", "Berlangsung", "Terjadwal"],
      default: "Terjadwal",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const TrainingSchedule =
  mongoose.models.TrainingSchedule ||
  mongoose.model<ITrainingSchedule>("TrainingSchedule", TrainingScheduleSchema);

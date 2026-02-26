import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  date: Date;
  schedule: mongoose.Types.ObjectId;
  athlete: mongoose.Types.ObjectId;
  status: string;
  markedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: Date, required: true },
    schedule: { type: Schema.Types.ObjectId, ref: "TrainingSchedule", required: true },
    athlete: { type: Schema.Types.ObjectId, ref: "Athlete", required: true },
    status: {
      type: String,
      required: true,
      enum: ["Hadir", "Izin", "Tidak Hadir"],
    },
    markedBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index: one attendance record per athlete per schedule
AttendanceSchema.index({ schedule: 1, athlete: 1 }, { unique: true });

export const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);

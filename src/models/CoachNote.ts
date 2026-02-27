import mongoose, { Schema, Document } from "mongoose";

export interface ICoachNote extends Document {
  athlete: mongoose.Types.ObjectId;
  date: Date;
  type: string;
  content: string;
  coach: string;
  createdAt: Date;
  updatedAt: Date;
}

const CoachNoteSchema = new Schema<ICoachNote>(
  {
    athlete: { type: Schema.Types.ObjectId, ref: "Athlete", required: true },
    date: { type: Date, required: true },
    type: { type: String, required: true, enum: ["POST-MATCH", "TRAINING"] },
    content: { type: String, required: true },
    coach: { type: String, required: true },
  },
  { timestamps: true }
);

CoachNoteSchema.index({ athlete: 1, date: -1 });

export const CoachNote =
  mongoose.models.CoachNote ||
  mongoose.model<ICoachNote>("CoachNote", CoachNoteSchema);

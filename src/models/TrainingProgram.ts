import mongoose, { Schema, Document } from "mongoose";

export interface IDrill {
  name: string;
  description: string;
}

export interface ITrainingProgram extends Document {
  name: string;
  type: string;
  description: string;
  objective: string;
  target: string;
  duration: number;
  drills: IDrill[];
  assignedAthletes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DrillSchema = new Schema<IDrill>({
  name: { type: String, required: true },
  description: { type: String, default: "" },
});

const TrainingProgramSchema = new Schema<ITrainingProgram>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["Teknik", "Fisik", "Taktik"] },
    description: { type: String, required: true },
    objective: { type: String, default: "" },
    target: { type: String, required: true },
    duration: { type: Number, required: true },
    drills: [DrillSchema],
    assignedAthletes: [{ type: Schema.Types.ObjectId, ref: "Athlete" }],
  },
  { timestamps: true }
);

TrainingProgramSchema.index({ name: 1 });
TrainingProgramSchema.index({ type: 1 });

export const TrainingProgram =
  mongoose.models.TrainingProgram ||
  mongoose.model<ITrainingProgram>("TrainingProgram", TrainingProgramSchema);

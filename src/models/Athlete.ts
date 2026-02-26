import mongoose, { Schema, Document } from "mongoose";

export interface IInjury {
  type: string;
  date: Date;
  status: string;
  severity?: string;
  recoveryWeeks?: number;
}

export interface IPerformanceEntry {
  date: Date;
  score: number;
  type: string;
}

export interface IAthlete extends Document {
  customId: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  category: string;
  position: string;
  status: string;
  height: number;
  weight: number;
  phone: string;
  address: string;
  joinDate: Date;
  photo?: string;
  injuries: IInjury[];
  recentPerformance: IPerformanceEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const InjurySchema = new Schema<IInjury>({
  type: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true, default: "Dalam Pemulihan" },
  severity: { type: String, enum: ["Ringan", "Sedang", "Berat"] },
  recoveryWeeks: { type: Number, default: 4 },
});

const PerformanceEntrySchema = new Schema<IPerformanceEntry>({
  date: { type: Date, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  type: { type: String, required: true, enum: ["Training", "Post-Match"] },
});

const AthleteSchema = new Schema<IAthlete>(
  {
    customId: { type: String, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Laki-laki", "Perempuan"] },
    category: { type: String, required: true, enum: ["Pemula", "Junior", "Senior"] },
    position: { type: String, required: true, enum: ["Tunggal", "Ganda", "Keduanya"] },
    status: {
      type: String,
      required: true,
      enum: ["Aktif", "Pemulihan", "Non-Aktif", "Pro Roster"],
      default: "Aktif",
    },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    joinDate: { type: Date, required: true },
    photo: { type: String },
    injuries: [InjurySchema],
    recentPerformance: [PerformanceEntrySchema],
  },
  { timestamps: true }
);

// Auto-generate customId before saving
AthleteSchema.pre("save", async function () {
  if (!this.customId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Athlete").countDocuments();
    this.customId = `BC-${year}-${String(count + 1).padStart(3, "0")}`;
  }
});

// Virtual: age
AthleteSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return 0;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

AthleteSchema.set("toJSON", { virtuals: true });
AthleteSchema.set("toObject", { virtuals: true });

export const Athlete =
  mongoose.models.Athlete || mongoose.model<IAthlete>("Athlete", AthleteSchema);

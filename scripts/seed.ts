import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// --- Model Schemas (inline to avoid path alias issues when running with tsx) ---

const InjurySchema = new mongoose.Schema({
  type: String,
  date: Date,
  status: String,
  severity: String,
});

const PerformanceEntrySchema = new mongoose.Schema({
  date: Date,
  score: Number,
  type: String,
});

const AthleteSchema = new mongoose.Schema(
  {
    customId: { type: String, unique: true },
    name: String,
    dateOfBirth: Date,
    gender: String,
    category: String,
    position: String,
    status: { type: String, default: "Aktif" },
    height: Number,
    weight: Number,
    phone: String,
    address: String,
    joinDate: Date,
    photo: String,
    injuries: [InjurySchema],
    recentPerformance: [PerformanceEntrySchema],
  },
  { timestamps: true }
);
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

const TrainingProgramSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    description: String,
    objective: String,
    target: String,
    duration: Number,
    drills: [{ name: String, description: String }],
    assignedAthletes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Athlete" }],
  },
  { timestamps: true }
);

const TrainingScheduleSchema = new mongoose.Schema(
  {
    program: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingProgram" },
    date: Date,
    day: String,
    startTime: String,
    endTime: String,
    venue: String,
    coach: String,
    athletes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Athlete" }],
    status: { type: String, default: "Terjadwal" },
    notes: String,
  },
  { timestamps: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    date: Date,
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingSchedule" },
    athlete: { type: mongoose.Schema.Types.ObjectId, ref: "Athlete" },
    status: String,
    markedBy: String,
  },
  { timestamps: true }
);

const PerformanceRecordSchema = new mongoose.Schema(
  {
    athlete: { type: mongoose.Schema.Types.ObjectId, ref: "Athlete" },
    date: Date,
    score: Number,
    type: String,
    stats: {
      smashSpeed: Number,
      footworkRating: Number,
      winProbability: Number,
      netAccuracy: Number,
    },
    recovery: {
      overall: Number,
      sleepScore: Number,
      hrvStatus: String,
    },
    trend: String,
    change: String,
  },
  { timestamps: true }
);

const CoachNoteSchema = new mongoose.Schema(
  {
    athlete: { type: mongoose.Schema.Types.ObjectId, ref: "Athlete" },
    date: Date,
    type: String,
    content: String,
    coach: String,
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    role: String,
    status: { type: String, default: "Aktif" },
    password: String,
  },
  { timestamps: true }
);

const ClubSettingsSchema = new mongoose.Schema(
  {
    clubName: String,
    phone: String,
    address: String,
    email: String,
    website: String,
    logo: String,
    favicon: String,
  },
  { timestamps: true }
);

// --- Models ---
const Athlete = mongoose.models.Athlete || mongoose.model("Athlete", AthleteSchema);
const TrainingProgram = mongoose.models.TrainingProgram || mongoose.model("TrainingProgram", TrainingProgramSchema);
const TrainingSchedule = mongoose.models.TrainingSchedule || mongoose.model("TrainingSchedule", TrainingScheduleSchema);
const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
const PerformanceRecord = mongoose.models.PerformanceRecord || mongoose.model("PerformanceRecord", PerformanceRecordSchema);
const CoachNote = mongoose.models.CoachNote || mongoose.model("CoachNote", CoachNoteSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const ClubSettings = mongoose.models.ClubSettings || mongoose.model("ClubSettings", ClubSettingsSchema);

// --- Helpers ---
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// --- Seed Data ---
async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bclub";

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!\n");

  // Clear all collections
  console.log("Clearing existing data...");
  await Promise.all([
    Athlete.deleteMany({}),
    TrainingProgram.deleteMany({}),
    TrainingSchedule.deleteMany({}),
    Attendance.deleteMany({}),
    PerformanceRecord.deleteMany({}),
    CoachNote.deleteMany({}),
    User.deleteMany({}),
    ClubSettings.deleteMany({}),
  ]);

  // ═══════════════════════════════════════════════════════
  // 1. ATHLETES
  // ═══════════════════════════════════════════════════════
  console.log("Seeding athletes...");
  const athletesData = [
    {
      customId: "BC-2025-001",
      name: "Marcus Fernaldi",
      dateOfBirth: new Date("2000-02-14"),
      gender: "Laki-laki",
      category: "Senior",
      position: "Ganda",
      status: "Aktif",
      height: 178,
      weight: 72,
      phone: "081234567801",
      address: "Jl. Sudirman No. 10, Jakarta Selatan",
      joinDate: new Date("2022-01-15"),
      injuries: [
        { type: "Keseleo Pergelangan Kaki", date: daysAgo(90), status: "Sembuh", severity: "Ringan" },
      ],
      recentPerformance: [
        { date: daysAgo(2), score: 88, type: "Post-Match" },
        { date: daysAgo(5), score: 85, type: "Training" },
        { date: daysAgo(9), score: 82, type: "Training" },
        { date: daysAgo(14), score: 86, type: "Post-Match" },
      ],
    },
    {
      customId: "BC-2025-002",
      name: "Kevin Sanjaya",
      dateOfBirth: new Date("1999-08-02"),
      gender: "Laki-laki",
      category: "Senior",
      position: "Ganda",
      status: "Pro Roster",
      height: 170,
      weight: 65,
      phone: "081234567802",
      address: "Jl. Gatot Subroto No. 22, Bandung",
      joinDate: new Date("2021-03-10"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(1), score: 92, type: "Post-Match" },
        { date: daysAgo(4), score: 90, type: "Training" },
        { date: daysAgo(8), score: 88, type: "Training" },
        { date: daysAgo(12), score: 91, type: "Post-Match" },
      ],
    },
    {
      customId: "BC-2025-003",
      name: "Anthony Sinisuka",
      dateOfBirth: new Date("2001-07-15"),
      gender: "Laki-laki",
      category: "Senior",
      position: "Tunggal",
      status: "Pro Roster",
      height: 175,
      weight: 70,
      phone: "081234567803",
      address: "Jl. Ahmad Yani No. 5, Surabaya",
      joinDate: new Date("2021-08-01"),
      injuries: [
        { type: "Keseleo Pergelangan Kaki", date: daysAgo(75), status: "Sembuh", severity: "Ringan" },
      ],
      recentPerformance: [
        { date: daysAgo(3), score: 90, type: "Post-Match" },
        { date: daysAgo(7), score: 87, type: "Training" },
        { date: daysAgo(11), score: 85, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-004",
      name: "Gregoria Mariska",
      dateOfBirth: new Date("2002-03-22"),
      gender: "Perempuan",
      category: "Senior",
      position: "Tunggal",
      status: "Aktif",
      height: 168,
      weight: 58,
      phone: "081234567804",
      address: "Jl. Diponegoro No. 17, Semarang",
      joinDate: new Date("2022-06-01"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(2), score: 84, type: "Training" },
        { date: daysAgo(6), score: 80, type: "Training" },
        { date: daysAgo(10), score: 82, type: "Post-Match" },
      ],
    },
    {
      customId: "BC-2025-005",
      name: "Apriyani Rahayu",
      dateOfBirth: new Date("2001-11-29"),
      gender: "Perempuan",
      category: "Senior",
      position: "Ganda",
      status: "Aktif",
      height: 165,
      weight: 56,
      phone: "081234567805",
      address: "Jl. Pahlawan No. 8, Makassar",
      joinDate: new Date("2022-04-20"),
      injuries: [
        { type: "Nyeri Bahu", date: daysAgo(10), status: "Dalam Pemulihan", severity: "Ringan" },
      ],
      recentPerformance: [
        { date: daysAgo(3), score: 83, type: "Training" },
        { date: daysAgo(8), score: 79, type: "Post-Match" },
        { date: daysAgo(13), score: 81, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-006",
      name: "Siti Fadia",
      dateOfBirth: new Date("2003-05-10"),
      gender: "Perempuan",
      category: "Junior",
      position: "Ganda",
      status: "Aktif",
      height: 163,
      weight: 54,
      phone: "081234567806",
      address: "Jl. Merdeka No. 33, Yogyakarta",
      joinDate: new Date("2023-01-10"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(4), score: 76, type: "Training" },
        { date: daysAgo(9), score: 73, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-007",
      name: "Rizki Amelia",
      dateOfBirth: new Date("2004-09-12"),
      gender: "Perempuan",
      category: "Junior",
      position: "Tunggal",
      status: "Aktif",
      height: 166,
      weight: 55,
      phone: "081234567807",
      address: "Jl. Veteran No. 45, Malang",
      joinDate: new Date("2023-05-01"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(2), score: 74, type: "Training" },
        { date: daysAgo(7), score: 70, type: "Post-Match" },
      ],
    },
    {
      customId: "BC-2025-008",
      name: "Fajar Alfian",
      dateOfBirth: new Date("1998-01-26"),
      gender: "Laki-laki",
      category: "Senior",
      position: "Ganda",
      status: "Pemulihan",
      height: 180,
      weight: 75,
      phone: "081234567808",
      address: "Jl. Imam Bonjol No. 12, Jakarta Utara",
      joinDate: new Date("2021-03-15"),
      injuries: [
        { type: "Cedera Lutut", date: daysAgo(14), status: "Dalam Pemulihan", severity: "Sedang" },
      ],
      recentPerformance: [
        { date: daysAgo(15), score: 72, type: "Training" },
        { date: daysAgo(20), score: 78, type: "Post-Match" },
      ],
    },
    {
      customId: "BC-2025-009",
      name: "Rian Ardianto",
      dateOfBirth: new Date("1998-08-17"),
      gender: "Laki-laki",
      category: "Senior",
      position: "Ganda",
      status: "Aktif",
      height: 176,
      weight: 71,
      phone: "081234567809",
      address: "Jl. Hayam Wuruk No. 9, Denpasar",
      joinDate: new Date("2021-06-01"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(1), score: 85, type: "Training" },
        { date: daysAgo(5), score: 82, type: "Post-Match" },
        { date: daysAgo(10), score: 80, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-010",
      name: "Dwi Putra",
      dateOfBirth: new Date("2008-04-03"),
      gender: "Laki-laki",
      category: "Pemula",
      position: "Tunggal",
      status: "Aktif",
      height: 162,
      weight: 52,
      phone: "081234567810",
      address: "Jl. Pattimura No. 20, Solo",
      joinDate: new Date("2024-01-10"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(3), score: 58, type: "Training" },
        { date: daysAgo(8), score: 55, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-011",
      name: "Nadia Putri",
      dateOfBirth: new Date("2009-12-18"),
      gender: "Perempuan",
      category: "Pemula",
      position: "Keduanya",
      status: "Aktif",
      height: 158,
      weight: 48,
      phone: "081234567811",
      address: "Jl. Teuku Umar No. 7, Medan",
      joinDate: new Date("2024-03-05"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(4), score: 52, type: "Training" },
        { date: daysAgo(10), score: 48, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-012",
      name: "Rahmat Hidayat",
      dateOfBirth: new Date("2005-06-25"),
      gender: "Laki-laki",
      category: "Junior",
      position: "Tunggal",
      status: "Aktif",
      height: 172,
      weight: 63,
      phone: "081234567812",
      address: "Jl. Cut Nyak Dien No. 14, Palembang",
      joinDate: new Date("2023-08-20"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(2), score: 71, type: "Training" },
        { date: daysAgo(6), score: 68, type: "Post-Match" },
        { date: daysAgo(11), score: 65, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-013",
      name: "Putri Kusuma",
      dateOfBirth: new Date("2005-02-28"),
      gender: "Perempuan",
      category: "Junior",
      position: "Ganda",
      status: "Aktif",
      height: 165,
      weight: 53,
      phone: "081234567813",
      address: "Jl. Kartini No. 11, Malang",
      joinDate: new Date("2023-09-15"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(3), score: 69, type: "Training" },
        { date: daysAgo(7), score: 66, type: "Training" },
      ],
    },
    {
      customId: "BC-2025-014",
      name: "Leo Rolly",
      dateOfBirth: new Date("2002-08-25"),
      gender: "Laki-laki",
      category: "Senior",
      position: "Ganda",
      status: "Pemulihan",
      height: 180,
      weight: 75,
      phone: "081234567814",
      address: "Jl. Gajah Mada No. 30, Semarang",
      joinDate: new Date("2022-09-01"),
      injuries: [
        { type: "Cedera Hamstring", date: daysAgo(21), status: "Dalam Pemulihan", severity: "Berat" },
      ],
      recentPerformance: [
        { date: daysAgo(22), score: 68, type: "Training" },
        { date: daysAgo(28), score: 75, type: "Post-Match" },
      ],
    },
    {
      customId: "BC-2025-015",
      name: "Fikri Ahmad",
      dateOfBirth: new Date("2007-09-05"),
      gender: "Laki-laki",
      category: "Pemula",
      position: "Tunggal",
      status: "Aktif",
      height: 165,
      weight: 55,
      phone: "081234567815",
      address: "Jl. Sisingamangaraja No. 8, Medan",
      joinDate: new Date("2024-06-01"),
      injuries: [],
      recentPerformance: [
        { date: daysAgo(5), score: 50, type: "Training" },
        { date: daysAgo(12), score: 45, type: "Training" },
      ],
    },
  ];

  const athletes = await Athlete.insertMany(athletesData);
  console.log(`  Created ${athletes.length} athletes`);

  // ═══════════════════════════════════════════════════════
  // 2. TRAINING PROGRAMS
  // ═══════════════════════════════════════════════════════
  console.log("Seeding training programs...");
  const programsData = [
    {
      name: "Latihan Smash Power",
      type: "Teknik",
      description: "Program peningkatan kekuatan dan ketepatan smash untuk atlet level menengah hingga atas.",
      objective: "Meningkatkan kecepatan smash rata-rata 10% dalam 4 minggu",
      target: "Senior & Junior",
      duration: 90,
      drills: [
        { name: "Shadow Smash Drill", description: "Latihan bayangan gerakan smash dengan fokus pada teknik ayunan" },
        { name: "Target Smash", description: "Smash ke area target yang ditentukan di lapangan, 20 repetisi" },
        { name: "Jump Smash Repetition", description: "Latihan lompatan smash berulang dengan shuttlecock" },
        { name: "Wrist Snap Exercise", description: "30 repetisi dengan resistance band untuk kekuatan pergelangan" },
      ],
      assignedAthletes: [athletes[0]._id, athletes[1]._id, athletes[2]._id, athletes[4]._id, athletes[8]._id],
    },
    {
      name: "Footwork & Agility",
      type: "Fisik",
      description: "Pelatihan footwork dan kelincahan untuk pergerakan cepat di lapangan.",
      objective: "Meningkatkan kecepatan perpindahan posisi dan keseimbangan tubuh",
      target: "Semua Kategori",
      duration: 75,
      drills: [
        { name: "Ladder Drill", description: "Latihan kelincahan kaki dengan agility ladder" },
        { name: "Pola 6 Sudut", description: "Pola pergerakan ke 6 sudut lapangan secara berulang" },
        { name: "Reaction Sprint", description: "Sprint berdasarkan sinyal acak ke arah yang ditentukan" },
        { name: "Lateral Movement", description: "Pergerakan lateral cepat dengan langkah silang" },
      ],
      assignedAthletes: [athletes[0]._id, athletes[3]._id, athletes[5]._id, athletes[6]._id, athletes[9]._id, athletes[10]._id, athletes[11]._id],
    },
    {
      name: "Strategi Ganda Campuran",
      type: "Taktik",
      description: "Taktik dan strategi permainan ganda campuran: rotasi, serangan, dan pertahanan.",
      objective: "Memahami dan menguasai formasi serangan-bertahan dalam ganda campuran",
      target: "Senior Ganda",
      duration: 120,
      drills: [
        { name: "Rotasi Front-Back", description: "Latihan rotasi posisi depan dan belakang secara bergantian" },
        { name: "Simulasi Pertandingan", description: "Simulasi pertandingan dengan skenario situasi tertentu" },
        { name: "Pola Servis & Return", description: "Pola servis dan pengembalian dalam permainan ganda" },
      ],
      assignedAthletes: [athletes[0]._id, athletes[1]._id, athletes[4]._id, athletes[5]._id, athletes[8]._id],
    },
    {
      name: "Kondisi Fisik Dasar",
      type: "Fisik",
      description: "Program pengembangan kondisi fisik dasar untuk atlet pemula.",
      objective: "Membangun dasar kebugaran yang kuat untuk menunjang latihan teknik",
      target: "Pemula",
      duration: 60,
      drills: [
        { name: "Pemanasan Dinamis", description: "Peregangan dan pemanasan sebelum latihan inti" },
        { name: "Circuit Training", description: "Push up 20x, sit up 20x, plank 60 detik, burpee 10x" },
        { name: "Lari Interval", description: "Sprint 200m diselingi jog 400m, 5 set" },
      ],
      assignedAthletes: [athletes[9]._id, athletes[10]._id, athletes[14]._id],
    },
    {
      name: "Drop Shot & Netting",
      type: "Teknik",
      description: "Latihan teknik pukulan dekat net: drop shot, netting, dan net kill.",
      objective: "Meningkatkan akurasi pukulan net hingga 85%",
      target: "Junior & Senior",
      duration: 90,
      drills: [
        { name: "Net Spin Drill", description: "Latihan putaran shuttlecock di dekat net" },
        { name: "Cross Drop Shot", description: "Drop shot silang dari posisi belakang lapangan" },
        { name: "Net Kill Reaction", description: "Reaksi cepat untuk pukulan net kill" },
      ],
      assignedAthletes: [athletes[2]._id, athletes[3]._id, athletes[5]._id, athletes[6]._id, athletes[11]._id, athletes[12]._id],
    },
    {
      name: "Endurance Circuit",
      type: "Fisik",
      description: "Sirkuit ketahanan fisik untuk meningkatkan stamina pertandingan.",
      objective: "Meningkatkan daya tahan untuk pertandingan 3 set penuh",
      target: "Semua Level",
      duration: 80,
      drills: [
        { name: "Jump Rope", description: "Lompat tali 3 menit x 5 set" },
        { name: "Shadow Badminton", description: "Gerakan bayangan 5 menit tanpa henti" },
        { name: "Core Strength", description: "Plank, russian twist, mountain climber" },
        { name: "Shuttle Run", description: "Lari bolak-balik 20 meter x 10 set" },
      ],
      assignedAthletes: athletes.map((a) => a._id),
    },
  ];

  const programs = await TrainingProgram.insertMany(programsData);
  console.log(`  Created ${programs.length} programs`);

  // ═══════════════════════════════════════════════════════
  // 3. TRAINING SCHEDULES
  // ═══════════════════════════════════════════════════════
  console.log("Seeding schedules...");
  const schedulesData = [
    // Past - completed
    { program: programs[0]._id, date: daysAgo(21), startTime: "08:00", endTime: "09:30", venue: "GOR Utama", coach: "Peter Gade", athletes: [athletes[0]._id, athletes[1]._id, athletes[2]._id, athletes[8]._id], status: "Selesai", notes: "Fokus pada jump smash. Hasil baik." },
    { program: programs[1]._id, date: daysAgo(19), startTime: "15:00", endTime: "16:15", venue: "Lapangan Indoor A", coach: "Peter Gade", athletes: [athletes[0]._id, athletes[3]._id, athletes[5]._id, athletes[9]._id, athletes[10]._id], status: "Selesai", notes: "" },
    { program: programs[2]._id, date: daysAgo(17), startTime: "09:00", endTime: "11:00", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[0]._id, athletes[1]._id, athletes[4]._id, athletes[5]._id, athletes[8]._id], status: "Selesai", notes: "Latihan formasi rotasi ganda campuran" },
    { program: programs[3]._id, date: daysAgo(15), startTime: "07:00", endTime: "08:00", venue: "Lapangan Outdoor B", coach: "Peter Gade", athletes: [athletes[9]._id, athletes[10]._id, athletes[14]._id], status: "Selesai", notes: "" },
    { program: programs[4]._id, date: daysAgo(13), startTime: "10:00", endTime: "11:30", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[2]._id, athletes[3]._id, athletes[6]._id, athletes[11]._id, athletes[12]._id], status: "Selesai", notes: "Tingkatkan akurasi netting" },
    { program: programs[5]._id, date: daysAgo(11), startTime: "08:00", endTime: "09:20", venue: "GOR Utama", coach: "Peter Gade", athletes: athletes.filter((_, i) => i !== 7 && i !== 13).map((a) => a._id), status: "Selesai", notes: "Semua atlet aktif ikut" },
    { program: programs[0]._id, date: daysAgo(9), startTime: "08:00", endTime: "09:30", venue: "GOR Utama", coach: "Peter Gade", athletes: [athletes[0]._id, athletes[1]._id, athletes[4]._id, athletes[8]._id], status: "Selesai", notes: "" },
    { program: programs[1]._id, date: daysAgo(7), startTime: "15:00", endTime: "16:15", venue: "Lapangan Indoor A", coach: "Peter Gade", athletes: [athletes[1]._id, athletes[3]._id, athletes[6]._id, athletes[9]._id, athletes[10]._id, athletes[11]._id], status: "Selesai", notes: "" },
    { program: programs[4]._id, date: daysAgo(5), startTime: "09:00", endTime: "10:30", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[2]._id, athletes[3]._id, athletes[5]._id, athletes[6]._id, athletes[12]._id], status: "Selesai", notes: "Perbaikan teknik drop shot" },
    { program: programs[5]._id, date: daysAgo(3), startTime: "07:00", endTime: "08:20", venue: "Lapangan Outdoor B", coach: "Peter Gade", athletes: [athletes[0]._id, athletes[2]._id, athletes[4]._id, athletes[8]._id, athletes[9]._id, athletes[11]._id], status: "Selesai", notes: "" },
    { program: programs[2]._id, date: daysAgo(1), startTime: "09:00", endTime: "11:00", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[0]._id, athletes[1]._id, athletes[4]._id, athletes[5]._id], status: "Selesai", notes: "Evaluasi strategi ganda" },

    // Today - ongoing
    { program: programs[4]._id, date: daysAgo(0), startTime: "09:00", endTime: "10:30", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[2]._id, athletes[3]._id, athletes[5]._id, athletes[6]._id], status: "Berlangsung", notes: "Sesi pagi" },

    // Upcoming - scheduled
    { program: programs[0]._id, date: daysFromNow(1), startTime: "08:00", endTime: "09:30", venue: "GOR Utama", coach: "Peter Gade", athletes: [athletes[0]._id, athletes[1]._id, athletes[2]._id, athletes[4]._id], status: "Terjadwal", notes: "" },
    { program: programs[2]._id, date: daysFromNow(2), startTime: "09:00", endTime: "11:00", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[0]._id, athletes[1]._id, athletes[4]._id, athletes[5]._id], status: "Terjadwal", notes: "" },
    { program: programs[3]._id, date: daysFromNow(3), startTime: "07:00", endTime: "08:00", venue: "Lapangan Outdoor B", coach: "Peter Gade", athletes: [athletes[9]._id, athletes[10]._id, athletes[14]._id], status: "Terjadwal", notes: "" },
    { program: programs[1]._id, date: daysFromNow(4), startTime: "15:00", endTime: "16:15", venue: "Lapangan Indoor A", coach: "Peter Gade", athletes: [athletes[0]._id, athletes[3]._id, athletes[5]._id, athletes[6]._id, athletes[9]._id], status: "Terjadwal", notes: "" },
    { program: programs[5]._id, date: daysFromNow(5), startTime: "08:00", endTime: "09:20", venue: "GOR Utama", coach: "Peter Gade", athletes: athletes.filter((_, i) => i !== 7 && i !== 13).map((a) => a._id), status: "Terjadwal", notes: "" },
    { program: programs[4]._id, date: daysFromNow(7), startTime: "10:00", endTime: "11:30", venue: "GOR Utama", coach: "Liliyana Natsir", athletes: [athletes[2]._id, athletes[3]._id, athletes[5]._id, athletes[11]._id, athletes[12]._id], status: "Terjadwal", notes: "" },
  ];

  const schedules = await TrainingSchedule.insertMany(
    schedulesData.map((s) => ({
      ...s,
      day: dayNames[s.date.getDay()],
    }))
  );
  console.log(`  Created ${schedules.length} schedules`);

  // ═══════════════════════════════════════════════════════
  // 4. ATTENDANCE
  // ═══════════════════════════════════════════════════════
  console.log("Seeding attendance...");
  const attendanceRecords: any[] = [];
  const weightedStatuses = ["Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Izin", "Tidak Hadir"];

  // For completed + ongoing schedules
  for (let i = 0; i < 12; i++) {
    const sched = schedulesData[i];
    for (const athId of sched.athletes) {
      attendanceRecords.push({
        date: sched.date,
        schedule: schedules[i]._id,
        athlete: athId,
        status: pick(weightedStatuses),
        markedBy: sched.coach,
      });
    }
  }

  if (attendanceRecords.length > 0) {
    await Attendance.insertMany(attendanceRecords);
  }
  console.log(`  Created ${attendanceRecords.length} attendance records`);

  // ═══════════════════════════════════════════════════════
  // 5. PERFORMANCE RECORDS
  // ═══════════════════════════════════════════════════════
  console.log("Seeding performance records...");
  const perfRecords: any[] = [];

  // Base scores per athlete tier
  const tierScores: Record<number, number> = {
    0: 83, 1: 90, 2: 88, 3: 81, 4: 80, 5: 74, 6: 72,
    7: 73, 8: 82, 9: 55, 10: 50, 11: 68, 12: 67, 13: 70, 14: 48,
  };

  for (let aIdx = 0; aIdx < athletes.length; aIdx++) {
    const athId = athletes[aIdx]._id;
    const base = tierScores[aIdx] || 65;
    const numRecords = rand(6, 10);

    for (let r = 0; r < numRecords; r++) {
      const dayOffset = rand(1, 60);
      const score = Math.min(100, Math.max(0, base + rand(-8, 12)));
      const prevScore = Math.min(100, Math.max(0, base + rand(-8, 8)));
      const changeVal = score - prevScore;

      perfRecords.push({
        athlete: athId,
        date: daysAgo(dayOffset),
        score,
        type: pick(["Training", "Post-Match"]),
        stats: {
          smashSpeed: base > 75 ? rand(250, 350) : rand(180, 280),
          footworkRating: parseFloat((rand(base > 75 ? 65 : 45, 95) / 10).toFixed(1)),
          winProbability: rand(Math.max(30, base - 15), Math.min(95, base + 10)),
          netAccuracy: rand(Math.max(40, base - 10), Math.min(98, base + 12)),
        },
        recovery: {
          overall: rand(60, 100),
          sleepScore: rand(60, 100),
          hrvStatus: pick(["Excellent", "Good", "Good", "Fair"]),
        },
        trend: changeVal > 3 ? "up" : changeVal < -3 ? "down" : "neutral",
        change: `${changeVal > 0 ? "+" : ""}${changeVal}%`,
      });
    }
  }

  perfRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
  await PerformanceRecord.insertMany(perfRecords);
  console.log(`  Created ${perfRecords.length} performance records`);

  // ═══════════════════════════════════════════════════════
  // 6. COACH NOTES
  // ═══════════════════════════════════════════════════════
  console.log("Seeding coach notes...");
  const trainingNotes = [
    "Footwork sudah lebih baik, perlu konsisten di sesi berikutnya.",
    "Smash power meningkat, tapi akurasi perlu ditingkatkan.",
    "Stamina di set ketiga mulai menurun, perlu latihan endurance lebih.",
    "Pergerakan ke sudut belakang lapangan sudah cepat, pertahankan.",
    "Teknik backhand drop shot masih perlu perbaikan.",
    "Konsistensi service sudah baik, lanjutkan latihan rutin.",
    "Refleks di depan net sangat baik hari ini. Progres pesat.",
    "Perlu peningkatan kecepatan reaksi di area tengah lapangan.",
    "Latihan shadow footwork menunjukkan hasil positif.",
    "Koordinasi dengan pasangan ganda sudah lebih solid.",
  ];

  const matchNotes = [
    "Performa bagus di semifinal, mental game sudah kuat.",
    "Kalah di set ketiga karena kurang fokus. Perlu latihan mental.",
    "Kemampuan rally panjang sudah meningkat signifikan.",
    "Strategi permainan cepat berhasil di set pertama, kurang efektif di set kedua.",
    "Perlu adaptasi lebih cepat terhadap pola permainan lawan.",
    "Defense di area backhand masih lemah, lawan memanfaatkan ini.",
    "Servis pendek sangat efektif hari ini. Lawan kesulitan mengembalikan.",
    "Perlu variasi serangan lebih banyak, terlalu mudah dibaca lawan.",
    "Konsistensi smash di set terakhir sangat baik. Lanjutkan.",
    "Perlu kontrol emosi saat tertinggal poin.",
  ];

  const coachNotesData: any[] = [];
  for (let aIdx = 0; aIdx < athletes.length; aIdx++) {
    const numNotes = rand(2, 5);
    for (let n = 0; n < numNotes; n++) {
      const isMatch = Math.random() > 0.5;
      coachNotesData.push({
        athlete: athletes[aIdx]._id,
        date: daysAgo(rand(1, 45)),
        type: isMatch ? "POST-MATCH" : "TRAINING",
        content: isMatch ? pick(matchNotes) : pick(trainingNotes),
        coach: pick(["Peter Gade", "Liliyana Natsir"]),
      });
    }
  }

  await CoachNote.insertMany(coachNotesData);
  console.log(`  Created ${coachNotesData.length} coach notes`);

  // ═══════════════════════════════════════════════════════
  // 7. USERS
  // ═══════════════════════════════════════════════════════
  console.log("Seeding users...");
  const usersRaw = [
    { name: "Admin Utama", email: "admin@bclub.id", phone: "021-5551234", role: "Admin", status: "Aktif", password: "admin123" },
    { name: "Peter Gade", email: "peter@bclub.id", phone: "081111222333", role: "Pelatih", status: "Aktif", password: "coach123" },
    { name: "Liliyana Natsir", email: "liliyana@bclub.id", phone: "081222333444", role: "Pelatih", status: "Aktif", password: "coach123" },
    { name: "Marcus Fernaldi", email: "marcus@bclub.id", phone: "081234567801", role: "Atlet", status: "Aktif", password: "atlet123" },
    { name: "Kevin Sanjaya", email: "kevin@bclub.id", phone: "081234567802", role: "Atlet", status: "Aktif", password: "atlet123" },
    { name: "Gregoria Mariska", email: "gregoria@bclub.id", phone: "081234567804", role: "Atlet", status: "Aktif", password: "atlet123" },
    { name: "Budi Santoso", email: "ketua@bclub.id", phone: "081777888999", role: "Ketua Klub", status: "Aktif", password: "ketua123" },
    { name: "Susi Susanti", email: "susi@bclub.id", phone: "081333444555", role: "Atlet", status: "Non-Aktif", password: "atlet123" },
  ];

  const usersData = await Promise.all(
    usersRaw.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 12),
    }))
  );

  await User.insertMany(usersData);
  console.log(`  Created ${usersData.length} users`);

  // ═══════════════════════════════════════════════════════
  // 8. CLUB SETTINGS
  // ═══════════════════════════════════════════════════════
  console.log("Seeding club settings...");
  await ClubSettings.create({
    clubName: "B-Club Badminton",
    phone: "021-5551234",
    address: "Jl. Jendral Sudirman No. 100, Jakarta Selatan, DKI Jakarta 12190",
    email: "info@bclub.id",
    website: "https://bclub.id",
    logo: "",
    favicon: "",
  });
  console.log("  Created club settings");

  // ═══════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════
  console.log("\n========================================");
  console.log("  SEED COMPLETED SUCCESSFULLY!");
  console.log("========================================");
  console.log(`  Athletes:             ${athletes.length}`);
  console.log(`  Programs:             ${programs.length}`);
  console.log(`  Schedules:            ${schedules.length}`);
  console.log(`  Attendance records:   ${attendanceRecords.length}`);
  console.log(`  Performance records:  ${perfRecords.length}`);
  console.log(`  Coach notes:          ${coachNotesData.length}`);
  console.log(`  Users:                ${usersData.length}`);
  console.log(`  Club settings:        1`);
  console.log("========================================");
  console.log("\n  Login credentials:");
  console.log("  admin@bclub.id    / admin123   (Admin)");
  console.log("  peter@bclub.id    / coach123   (Pelatih)");
  console.log("  liliyana@bclub.id / coach123   (Pelatih)");
  console.log("  marcus@bclub.id   / atlet123   (Atlet)");
  console.log("  kevin@bclub.id    / atlet123   (Atlet)");
  console.log("  gregoria@bclub.id / atlet123   (Atlet)");
  console.log("  ketua@bclub.id    / ketua123   (Ketua Klub)");
  console.log("========================================\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

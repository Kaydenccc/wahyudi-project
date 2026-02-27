import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Athlete } from "@/models/Athlete";
import { createUserSchema } from "@/lib/validations/user";
import { requireRole } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";
import { syncOrphanedAthletes } from "@/lib/sync-athletes";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Ketua Klub"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    // Auto-sync: create missing Athlete records for Atlet users without athleteId
    await syncOrphanedAthletes();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const validated = createUserSchema.parse(body);

    // Check for existing email
    const emailLower = validated.email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(validated.password);
    const user = await User.create({ ...validated, email: emailLower, password: hashedPassword });

    // If role is Atlet, also create an Athlete record and link it
    if (validated.role === "Atlet") {
      try {
        const athlete = await Athlete.create({
          name: validated.name,
          dateOfBirth: new Date("2000-01-01"),
          gender: "Laki-laki",
          category: "Pemula",
          position: "Tunggal",
          height: 170,
          weight: 60,
          phone: validated.phone || "",
          address: "",
          joinDate: new Date(),
          status: "Aktif",
        });
        await User.findByIdAndUpdate(user._id, { athleteId: athlete._id });
      } catch (athleteError) {
        // Rollback: delete the user if athlete creation fails
        await User.findByIdAndDelete(user._id);
        throw athleteError;
      }
    }

    const updatedUser = await User.findById(user._id).select("-password").lean();
    return NextResponse.json(updatedUser, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}

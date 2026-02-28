import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Athlete } from "@/models/Athlete";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/user";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate with Zod discriminated union
    const validated = registerSchema.parse(body);

    // Check for existing email
    const existing = await User.findOne({ email: validated.email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validated.password);

    // Build user data
    const userData: Record<string, unknown> = {
      name: validated.name,
      email: validated.email.trim().toLowerCase(),
      password: hashedPassword,
      role: validated.role,
      status: "Menunggu",
      phone: validated.phone,
      address: validated.address,
    };

    // Add role-specific fields
    if (validated.role === "Atlet") {
      userData.dateOfBirth = new Date(validated.dateOfBirth);
      userData.gender = validated.gender;
      userData.category = validated.category;
      userData.position = validated.position;
      userData.height = validated.height;
      userData.weight = validated.weight;
    } else if (validated.role === "Pelatih") {
      userData.dateOfBirth = new Date(validated.dateOfBirth);
      userData.gender = validated.gender;
    }

    const user = await User.create(userData);

    // If Atlet, also create an Athlete record and link it
    if (validated.role === "Atlet") {
      try {
        const athlete = await Athlete.create({
          name: validated.name,
          dateOfBirth: new Date(validated.dateOfBirth),
          gender: validated.gender,
          category: validated.category,
          position: validated.position,
          height: validated.height,
          weight: validated.weight,
          phone: validated.phone,
          address: validated.address,
          joinDate: new Date(),
          status: "Menunggu",
        });

        await User.findByIdAndUpdate(user._id, { athleteId: athlete._id });
      } catch (athleteError) {
        // Rollback: delete the user if athlete creation fails
        await User.findByIdAndDelete(user._id);
        throw athleteError;
      }
    }

    return NextResponse.json(
      { message: "Registrasi berhasil. Akun Anda menunggu persetujuan admin." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues?.[0]?.message || "Data tidak valid";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Registrasi gagal" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Athlete } from "@/models/Athlete";
import { requireAuth } from "@/lib/api-auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  updateProfileAtletSchema,
  updateProfilePelatihSchema,
  updateProfileKetuaKlubSchema,
  updateProfileAdminSchema,
} from "@/lib/validations/user";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const user = await User.findById(auth.user.id)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    // Get current user to know their role
    const currentUser = await User.findById(auth.user.id).lean() as any;
    if (!currentUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate based on role
    let validated: Record<string, any>;
    if (currentUser.role === "Atlet") {
      validated = updateProfileAtletSchema.parse(body);
    } else if (currentUser.role === "Pelatih") {
      validated = updateProfilePelatihSchema.parse(body);
    } else if (currentUser.role === "Ketua Klub") {
      validated = updateProfileKetuaKlubSchema.parse(body);
    } else {
      validated = updateProfileAdminSchema.parse(body);
    }

    const updateData: Record<string, unknown> = { ...validated };

    // Check email uniqueness if changing email
    if (validated.email) {
      const emailExists = await User.findOne({
        email: validated.email.toLowerCase(),
        _id: { $ne: auth.user.id },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 409 }
        );
      }
      updateData.email = validated.email.toLowerCase();
    }

    // Hash password if provided — require current password verification
    if (validated.password) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { error: "Password lama wajib diisi untuk mengubah password" },
          { status: 400 }
        );
      }
      const userWithPassword = await User.findById(auth.user.id).select("password").lean() as any;
      const isValid = await verifyPassword(body.currentPassword, userWithPassword.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Password lama tidak sesuai" },
          { status: 400 }
        );
      }
      updateData.password = await hashPassword(validated.password);
    } else {
      delete updateData.password;
    }

    // Convert date string to Date object
    if (validated.dateOfBirth) {
      updateData.dateOfBirth = new Date(validated.dateOfBirth);
    }

    const user = await User.findByIdAndUpdate(auth.user.id, updateData, {
      new: true,
    })
      .select("-password")
      .lean() as any;

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // If Atlet, sync relevant fields to linked Athlete record
    if (currentUser.role === "Atlet" && currentUser.athleteId) {
      const athleteUpdate: Record<string, unknown> = {};
      if (validated.name) athleteUpdate.name = validated.name;
      if (validated.phone) athleteUpdate.phone = validated.phone;
      if (validated.dateOfBirth) athleteUpdate.dateOfBirth = new Date(validated.dateOfBirth);
      if (validated.gender) athleteUpdate.gender = validated.gender;
      if (validated.address) athleteUpdate.address = validated.address;
      if (validated.category) athleteUpdate.category = validated.category;
      if (validated.position) athleteUpdate.position = validated.position;
      if (validated.height) athleteUpdate.height = validated.height;
      if (validated.weight) athleteUpdate.weight = validated.weight;

      if (Object.keys(athleteUpdate).length > 0) {
        await Athlete.findByIdAndUpdate(currentUser.athleteId, athleteUpdate);
      }
    }

    return NextResponse.json(user);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Gagal update profil" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { requireAuth } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const body = await request.json();
    const updateData: Record<string, string> = {};

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.phone) updateData.phone = body.phone;
    if (body.password && body.password.length >= 8) {
      updateData.password = await hashPassword(body.password);
    }

    const user = await User.findByIdAndUpdate(auth.user.id, updateData, {
      new: true,
    })
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
      { error: error.message || "Gagal update profil" },
      { status: 500 }
    );
  }
}

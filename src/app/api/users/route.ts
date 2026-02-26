import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createUserSchema } from "@/lib/validations/user";
import { requireRole } from "@/lib/api-auth";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Admin", "Ketua Klub"]);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

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
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    if (user.status === "Menunggu") {
      return NextResponse.json(
        { error: "Akun Anda menunggu persetujuan admin." },
        { status: 403 }
      );
    }

    if (user.status === "Non-Aktif") {
      return NextResponse.json(
        { error: "Akun Anda tidak aktif. Hubungi admin." },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await createToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Login gagal" },
      { status: 500 }
    );
  }
}

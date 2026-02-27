import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Athlete } from "@/models/Athlete";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Enrich session with athlete photo if user is Atlet
  let photo = "";
  if (session.role === "Atlet") {
    try {
      await connectDB();
      const user = await User.findById(session.id).select("athleteId").lean() as any;
      if (user?.athleteId) {
        const athlete = await Athlete.findById(user.athleteId).select("photo").lean() as any;
        photo = athlete?.photo || "";
      }
    } catch {
      // ignore — photo is optional
    }
  }

  return NextResponse.json({
    user: { ...session, ...(photo ? { photo } : {}) },
  });
}

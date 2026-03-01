import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (include HEIC/HEIF for iOS camera photos)
    // On iOS Safari, file.type can sometimes be empty string — fall back to extension check
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    const fileExt = file.name?.split(".").pop()?.toLowerCase() || "";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
    const isAllowedType = allowedTypes.includes(file.type) || file.type.startsWith("image/");
    const isAllowedExt = allowedExts.includes(fileExt);

    if (!file.type && !isAllowedExt) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan file gambar (JPG, PNG, WebP)." },
        { status: 400 }
      );
    }
    if (file.type && !isAllowedType) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan file gambar (JPG, PNG, WebP)." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Map MIME type to safe extension (don't trust user-provided extension)
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
    };
    const ext = mimeToExt[file.type] || (allowedExts.includes(fileExt) ? fileExt : "jpg");
    const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Upload gagal" },
      { status: 500 }
    );
  }
}

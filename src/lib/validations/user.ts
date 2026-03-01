import { z } from "zod";

// ── Existing schemas (unchanged) ──

export const createUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid").max(255),
  phone: z.string().max(20).default(""),
  role: z.enum(["Admin", "Pelatih", "Atlet", "Ketua Klub"]),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password maksimal 128 karakter"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(["Admin", "Pelatih", "Atlet", "Ketua Klub"]).optional(),
  status: z.enum(["Aktif", "Non-Aktif", "Menunggu"]).optional(),
  password: z.string().min(8).max(128).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ── Registration schemas (per role) ──

const registerAtletSchema = z.object({
  role: z.literal("Atlet"),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid").max(255),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password maksimal 128 karakter"),
  phone: z.string().min(1, "No. telepon wajib diisi").max(20),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Jenis kelamin wajib diisi" }),
  address: z.string().min(1, "Alamat wajib diisi").max(500),
  category: z.enum(
    ["Pra Usia Dini", "Usia Dini", "Anak-anak", "Pemula", "Remaja", "Taruna", "Dewasa"],
    { message: "Kategori wajib diisi" }
  ),
  position: z.enum(["Tunggal", "Ganda", "Keduanya"], { message: "Posisi wajib diisi" }),
  height: z.number().min(100, "Tinggi minimal 100 cm").max(250, "Tinggi maksimal 250 cm"),
  weight: z.number().min(30, "Berat minimal 30 kg").max(200, "Berat maksimal 200 kg"),
});

const registerPelatihSchema = z.object({
  role: z.literal("Pelatih"),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid").max(255),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password maksimal 128 karakter"),
  phone: z.string().min(1, "No. telepon wajib diisi").max(20),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Jenis kelamin wajib diisi" }),
  address: z.string().min(1, "Alamat wajib diisi").max(500),
});

const registerKetuaKlubSchema = z.object({
  role: z.literal("Ketua Klub"),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid").max(255),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password maksimal 128 karakter"),
  phone: z.string().min(1, "No. telepon wajib diisi").max(20),
  address: z.string().min(1, "Alamat wajib diisi").max(500),
});

export const registerSchema = z.discriminatedUnion("role", [
  registerAtletSchema,
  registerPelatihSchema,
  registerKetuaKlubSchema,
]);

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Profile update schemas (per role) ──

export const updateProfileAtletSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan"]).optional(),
  address: z.string().max(500).optional(),
  category: z
    .enum(["Pra Usia Dini", "Usia Dini", "Anak-anak", "Pemula", "Remaja", "Taruna", "Dewasa"])
    .optional(),
  position: z.enum(["Tunggal", "Ganda", "Keduanya"]).optional(),
  height: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(200).optional(),
});

export const updateProfilePelatihSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan"]).optional(),
  address: z.string().max(500).optional(),
});

export const updateProfileKetuaKlubSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128).optional(),
  address: z.string().max(500).optional(),
});

export const updateProfileAdminSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128).optional(),
  address: z.string().max(500).optional(),
});

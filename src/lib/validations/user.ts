import { z } from "zod";

// ── Existing schemas (unchanged) ──

export const createUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().default(""),
  role: z.enum(["Admin", "Pelatih", "Atlet", "Ketua Klub"]),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["Admin", "Pelatih", "Atlet", "Ketua Klub"]).optional(),
  status: z.enum(["Aktif", "Non-Aktif", "Menunggu"]).optional(),
  password: z.string().min(8).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ── Registration schemas (per role) ──

const registerAtletSchema = z.object({
  role: z.literal("Atlet"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(1, "No. telepon wajib diisi"),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Jenis kelamin wajib diisi" }),
  address: z.string().min(1, "Alamat wajib diisi"),
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
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(1, "No. telepon wajib diisi"),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Jenis kelamin wajib diisi" }),
  address: z.string().min(1, "Alamat wajib diisi"),
});

const registerKetuaKlubSchema = z.object({
  role: z.literal("Ketua Klub"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(1, "No. telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
});

export const registerSchema = z.discriminatedUnion("role", [
  registerAtletSchema,
  registerPelatihSchema,
  registerKetuaKlubSchema,
]);

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Profile update schemas (per role) ──

export const updateProfileAtletSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan"]).optional(),
  address: z.string().optional(),
  category: z
    .enum(["Pra Usia Dini", "Usia Dini", "Anak-anak", "Pemula", "Remaja", "Taruna", "Dewasa"])
    .optional(),
  position: z.enum(["Tunggal", "Ganda", "Keduanya"]).optional(),
  height: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(200).optional(),
});

export const updateProfilePelatihSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan"]).optional(),
  address: z.string().optional(),
});

export const updateProfileKetuaKlubSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  address: z.string().optional(),
});

export const updateProfileAdminSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  address: z.string().optional(),
});

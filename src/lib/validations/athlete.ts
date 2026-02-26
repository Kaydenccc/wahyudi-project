import { z } from "zod";

export const createAthleteSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  category: z.enum(["Pemula", "Junior", "Senior"]),
  position: z.enum(["Tunggal", "Ganda", "Keduanya"]),
  status: z.enum(["Aktif", "Pemulihan", "Non-Aktif", "Pro Roster"]).default("Aktif"),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
  phone: z.string().min(1, "No. telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  joinDate: z.string().min(1, "Tanggal bergabung wajib diisi"),
  photo: z.string().optional(),
});

// Manual partial schema WITHOUT .default() to prevent wiping existing data
export const updateAthleteSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().min(1).optional(),
  gender: z.enum(["Laki-laki", "Perempuan"]).optional(),
  category: z.enum(["Pemula", "Junior", "Senior"]).optional(),
  position: z.enum(["Tunggal", "Ganda", "Keduanya"]).optional(),
  status: z.enum(["Aktif", "Pemulihan", "Non-Aktif", "Pro Roster"]).optional(),
  height: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(200).optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  joinDate: z.string().min(1).optional(),
  photo: z.string().optional(),
});

export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;

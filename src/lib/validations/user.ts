import { z } from "zod";

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

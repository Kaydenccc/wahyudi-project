import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Nama program wajib diisi"),
  type: z.enum(["Teknik", "Fisik", "Taktik"]),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  objective: z.string().default(""),
  target: z.string().min(1, "Target wajib diisi"),
  duration: z.number().min(1, "Durasi wajib diisi"),
  drills: z.array(z.object({
    name: z.string().min(1),
    description: z.string().default(""),
  })).default([]),
  assignedAthletes: z.array(z.string()).default([]),
});

// Manual partial schema WITHOUT .default() to prevent wiping existing arrays
export const updateProgramSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["Teknik", "Fisik", "Taktik"]).optional(),
  description: z.string().min(1).optional(),
  objective: z.string().optional(),
  target: z.string().min(1).optional(),
  duration: z.number().min(1).optional(),
  drills: z.array(z.object({
    name: z.string().min(1),
    description: z.string().default(""),
  })).optional(),
  assignedAthletes: z.array(z.string()).optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

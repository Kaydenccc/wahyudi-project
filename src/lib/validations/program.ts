import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Nama program wajib diisi").max(200),
  type: z.enum(["Teknik", "Fisik", "Taktik"]),
  description: z.string().min(1, "Deskripsi wajib diisi").max(2000),
  objective: z.string().max(1000).default(""),
  target: z.string().min(1, "Target wajib diisi").max(500),
  duration: z.number().min(1, "Durasi wajib diisi"),
  drills: z.array(z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).default(""),
  })).default([]),
  assignedAthletes: z.array(z.string()).default([]),
});

// Manual partial schema WITHOUT .default() to prevent wiping existing arrays
export const updateProgramSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["Teknik", "Fisik", "Taktik"]).optional(),
  description: z.string().min(1).max(2000).optional(),
  objective: z.string().max(1000).optional(),
  target: z.string().min(1).max(500).optional(),
  duration: z.number().min(1).optional(),
  drills: z.array(z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).default(""),
  })).optional(),
  assignedAthletes: z.array(z.string()).optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

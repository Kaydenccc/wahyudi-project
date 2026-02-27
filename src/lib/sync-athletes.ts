import { User } from "@/models/User";
import { Athlete } from "@/models/Athlete";

/**
 * Auto-sync: finds all User records with role "Atlet" that have no linked
 * Athlete record, and creates one for each. This ensures that athletes
 * created through admin user management (or legacy data) appear in the
 * Athlete collection used by dashboard and public pages.
 */
export async function syncOrphanedAthletes() {
  const orphanedAtlets = (await User.find({
    role: "Atlet",
    $or: [{ athleteId: { $exists: false } }, { athleteId: null }],
  }).lean()) as any[];

  for (const orphan of orphanedAtlets) {
    try {
      const athlete = await Athlete.create({
        name: orphan.name,
        dateOfBirth: orphan.dateOfBirth || new Date("2000-01-01"),
        gender: orphan.gender || "Laki-laki",
        category: orphan.category || "Pemula",
        position: orphan.position || "Tunggal",
        height: orphan.height || 170,
        weight: orphan.weight || 60,
        phone: orphan.phone || "",
        address: orphan.address || "",
        joinDate: orphan.createdAt || new Date(),
        status: orphan.status === "Aktif" ? "Aktif" : "Menunggu",
      });
      await User.findByIdAndUpdate(orphan._id, { athleteId: athlete._id });
    } catch {
      console.error(`Failed to sync athlete for user ${orphan._id}`);
    }
  }
}

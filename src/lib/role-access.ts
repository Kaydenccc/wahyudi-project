// Single source of truth for role-based route access.
// Used by both middleware.ts and lib/auth.ts — do NOT duplicate this config elsewhere.
export const ROLE_ACCESS: Record<string, string[]> = {
  Admin: [
    "/dashboard",
    "/data-atlet",
    "/program-latihan",
    "/absensi",
    "/monitoring-performa",
    "/prestasi",
    "/laporan",
    "/pengaturan",
    "/profil",
  ],
  Pelatih: [
    "/dashboard",
    "/data-atlet",
    "/program-latihan",
    "/absensi",
    "/monitoring-performa",
    "/prestasi",
    "/laporan",
    "/profil",
  ],
  "Ketua Klub": [
    "/dashboard",
    "/data-atlet",
    "/monitoring-performa",
    "/prestasi",
    "/laporan",
    "/pengaturan",
    "/profil",
  ],
  Atlet: ["/dashboard", "/monitoring-performa", "/prestasi", "/profil"],
};

export function canAccessRoute(role: string, pathname: string): boolean {
  const allowedRoutes = ROLE_ACCESS[role];
  if (!allowedRoutes) return false;
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  FileText,
  Settings,
  Calendar,
  ListChecks,
} from "lucide-react";

export const APP_NAME = "B-Club";
export const APP_SUBTITLE = "PRO MANAGER";

export type MenuItem = {
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
  children?: { label: string; href: string; icon?: typeof LayoutDashboard }[];
};

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Pelatih", "Atlet", "Ketua Klub"],
  },
  {
    label: "Data Atlet",
    href: "/data-atlet",
    icon: Users,
    roles: ["Admin", "Pelatih", "Ketua Klub"],
  },
  {
    label: "Program Latihan",
    icon: BookOpen,
    roles: ["Admin", "Pelatih"],
    children: [
      { label: "Daftar Program", href: "/program-latihan", icon: ListChecks },
      { label: "Jadwal Latihan", href: "/program-latihan/jadwal", icon: Calendar },
    ],
  },
  {
    label: "Absensi",
    href: "/absensi",
    icon: ClipboardCheck,
    roles: ["Admin", "Pelatih"],
  },
  {
    label: "Monitoring Performa",
    href: "/monitoring-performa",
    icon: BarChart3,
    roles: ["Admin", "Pelatih", "Atlet", "Ketua Klub"],
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileText,
    roles: ["Admin", "Pelatih", "Ketua Klub"],
  },
];

export const settingsItem: MenuItem = {
  label: "Pengaturan",
  href: "/pengaturan",
  icon: Settings,
  roles: ["Admin", "Ketua Klub"],
};

export function getMenuForRole(role: string): MenuItem[] {
  return menuItems.filter((item) => !item.roles || item.roles.includes(role));
}

export function canSeeSettings(role: string): boolean {
  return !settingsItem.roles || settingsItem.roles.includes(role);
}

export const categories = ["Pemula", "Junior", "Senior"] as const;
export const positions = ["Tunggal", "Ganda", "Keduanya"] as const;
export const genders = ["Laki-laki", "Perempuan"] as const;
export const athleteStatuses = ["Aktif", "Pemulihan", "Non-Aktif", "Pro Roster"] as const;
export const trainingTypes = ["Teknik", "Fisik", "Taktik"] as const;
export const attendanceStatuses = ["Hadir", "Izin", "Tidak Hadir"] as const;
export const injurySeverities = ["Ringan", "Sedang", "Berat"] as const;

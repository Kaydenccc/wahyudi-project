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
  Trophy,
  UserCircle,
} from "lucide-react";

export const APP_NAME = "PB. TIGA BERLIAN";
export const APP_SUBTITLE = "BADMINTON";

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
    label: "Prestasi",
    href: "/prestasi",
    icon: Trophy,
    roles: ["Admin", "Pelatih", "Atlet", "Ketua Klub"],
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileText,
    roles: ["Admin", "Pelatih", "Ketua Klub"],
  },
  {
    label: "Profil Saya",
    href: "/profil",
    icon: UserCircle,
    roles: ["Atlet"],
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

export const categories = ["Pra Usia Dini", "Usia Dini", "Anak-anak", "Pemula", "Remaja", "Taruna", "Dewasa"] as const;
export const positions = ["Tunggal", "Ganda", "Keduanya"] as const;
export const genders = ["Laki-laki", "Perempuan"] as const;
export const athleteStatuses = ["Aktif", "Pemulihan", "Non-Aktif", "Pro Roster"] as const;
export const trainingTypes = ["Teknik", "Fisik", "Taktik"] as const;
export const attendanceStatuses = ["Hadir", "Izin", "Tidak Hadir"] as const;
export const injurySeverities = ["Ringan", "Sedang", "Berat"] as const;
export const achievementCategories = ["Turnamen", "Kejuaraan", "Peringkat", "Lainnya"] as const;
export const achievementLevels = ["Daerah", "Nasional", "Internasional"] as const;
export const achievementResults = ["Juara 1", "Juara 2", "Juara 3", "Partisipasi", "Lainnya"] as const;

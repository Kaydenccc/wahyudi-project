"use client";

import Link from "next/link";
import { UserPlus, CalendarPlus, FileBarChart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

const allActions = [
  {
    label: "Tambah Atlet Baru",
    href: "/data-atlet/tambah",
    icon: UserPlus,
    variant: "primary" as const,
    roles: ["Admin", "Pelatih"],
  },
  {
    label: "Sesi Baru",
    href: "/program-latihan/jadwal/tambah",
    icon: CalendarPlus,
    variant: "outline" as const,
    roles: ["Admin", "Pelatih"],
  },
  {
    label: "Buat Laporan",
    href: "/laporan",
    icon: FileBarChart,
    variant: "outline" as const,
    roles: ["Admin", "Pelatih", "Ketua Klub"],
  },
];

export function QuickActions() {
  const { user } = useSession();
  const actions = allActions.filter((a) => !user?.role || a.roles.includes(user.role));

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all hover:scale-[1.02]",
            action.variant === "primary"
              ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
              : "bg-secondary/50 border-border hover:bg-secondary"
          )}
        >
          <div className="flex items-center gap-3">
            <action.icon className={cn("h-5 w-5", action.variant === "primary" ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium", action.variant === "primary" ? "text-primary" : "text-foreground")}>
              {action.label}
            </span>
          </div>
          <ChevronRight className={cn("h-4 w-4", action.variant === "primary" ? "text-primary" : "text-muted-foreground")} />
        </Link>
      ))}
    </div>
  );
}

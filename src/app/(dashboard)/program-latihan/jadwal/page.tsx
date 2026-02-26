"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  ListChecks,
  Clock,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/use-schedules";
import { format } from "date-fns";

export default function JadwalLatihanPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const { schedules, isLoading } = useSchedules();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Latihan"
        description="Atur dan kelola jadwal sesi latihan yang terkait dengan program latihan."
      >
        <Link href="/program-latihan/jadwal/tambah">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Jadwal Baru
          </Button>
        </Link>
      </PageHeader>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("calendar")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            viewMode === "calendar"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Calendar className="h-4 w-4" />
          Kalender
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            viewMode === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <ListChecks className="h-4 w-4" />
          Daftar
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat jadwal...</div>
      ) : viewMode === "calendar" ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">
              Jadwal Latihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(startOfWeek);
                  d.setDate(startOfWeek.getDate() + i);
                  const dateStr = format(d, "yyyy-MM-dd");
                  const items = schedules.filter((s: any) => {
                    const sDate = s.date ? format(new Date(s.date), "yyyy-MM-dd") : "";
                    return sDate === dateStr;
                  });
                  return { date: d.getDate(), day: dayNames[d.getDay()], items };
                });
                return days.map((d) => (
                <div key={d.date} className="min-h-[140px]">
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground">{d.day}</p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        d.items.length > 0 ? "text-primary" : "text-foreground"
                      )}
                    >
                      {d.date}
                    </p>
                  </div>
                  {d.items.map((s: any) => (
                    <div
                      key={s._id}
                      className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs space-y-1"
                    >
                      <p className="font-medium text-primary truncate">
                        {s.program?.name || "—"}
                      </p>
                      <p className="text-muted-foreground">
                        {s.startTime}-{s.endTime}
                      </p>
                      <p className="text-muted-foreground">{s.venue}</p>
                    </div>
                  ))}
                </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Program
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tanggal
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Waktu
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tempat
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pelatih
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Atlet
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s: any) => (
                    <tr
                      key={s._id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={s.program?.type || ""} />
                          <span className="text-sm font-medium text-foreground">
                            {s.program?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {s.day}, {s.date ? format(new Date(s.date), "MMM dd, yyyy") : ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {s.startTime} - {s.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {s.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {s.coach}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {s.athletes?.length || 0} atlet
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

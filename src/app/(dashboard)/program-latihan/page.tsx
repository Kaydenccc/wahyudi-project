"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Calendar, ListChecks, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { usePrograms } from "@/hooks/use-programs";
import { useSchedules } from "@/hooks/use-schedules";
import { useSession } from "@/hooks/use-session";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const typeFilters = ["Semua Jenis", "Fisik", "Teknik", "Taktik"];

export default function ProgramLatihanPage() {
  const { user: sessionUser } = useSession();
  const canEdit = sessionUser?.role === "Admin" || sessionUser?.role === "Pelatih";
  const [activeType, setActiveType] = useState("Semua Jenis");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [weekOffset, setWeekOffset] = useState(0);

  const { programs, isLoading } = usePrograms(
    activeType !== "Semua Jenis" ? { type: activeType } : {}
  );
  const { schedules } = useSchedules();

  const filteredPrograms = programs;

  // Build week days for calendar
  const today = new Date();
  const currentWeekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Program Latihan"
        description="Rencanakan dan kelola jadwal latihan performa elit untuk tim Anda."
      >
        <Link href="/program-latihan/jadwal">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Lihat Jadwal
          </Button>
        </Link>
        {canEdit && (
          <Link href="/program-latihan/tambah">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Program Baru
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* View Toggle & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            Tampilan Kalender
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
            Tampilan Daftar
          </button>
        </div>
        <div className="flex items-center gap-2">
          {typeFilters.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                activeType === type
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat program...</div>
      ) : viewMode === "calendar" ? (
        /* Weekly Calendar View */
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Jadwal Minggu Ini</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground min-w-[180px] text-center">
                {format(weekDays[0], "d MMM", { locale: idLocale })} — {format(weekDays[6], "d MMM yyyy", { locale: idLocale })}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {weekOffset !== 0 && (
                <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} className="ml-2 text-xs">
                  Hari Ini
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                const daySchedules = schedules.filter((s: any) => {
                  if (!s.date) return false;
                  return isSameDay(new Date(s.date), day);
                });
                return (
                  <div key={i} className="min-h-[160px]">
                    <div className={cn(
                      "text-center mb-2 py-1.5 rounded-lg",
                      isToday ? "bg-primary/10" : ""
                    )}>
                      <p className="text-xs text-muted-foreground">{dayNames[i]}</p>
                      <p className={cn(
                        "text-sm font-semibold",
                        isToday ? "text-primary" : "text-foreground"
                      )}>
                        {format(day, "d")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {daySchedules.map((s: any) => (
                        <div
                          key={s._id}
                          className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs space-y-0.5 cursor-default hover:bg-primary/15 transition-colors"
                        >
                          <p className="font-medium text-primary truncate">
                            {s.program?.name || "—"}
                          </p>
                          <p className="text-muted-foreground">
                            {s.startTime} - {s.endTime}
                          </p>
                          <StatusBadge status={s.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List/Table View */
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Program</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jenis</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Durasi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atlet</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((program: any) => (
                    <tr key={program._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{program.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{program.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={program.type} />
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{program.target}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{program.duration} Menit</td>
                      <td className="px-6 py-4 text-sm text-foreground">{program.assignedAthletes?.length || 0} atlet</td>
                      <td className="px-6 py-4">
                        <Link href={`/program-latihan/${program._id}`}>
                          <Button variant="link" className="text-primary p-0 h-auto text-sm">
                            Lihat Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Stats */}
      <div className="flex items-center gap-8 pt-4 border-t border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Program
          </p>
          <p className="text-xl font-bold text-foreground">{filteredPrograms.length}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Durasi
          </p>
          <p className="text-xl font-bold text-foreground">
            {filteredPrograms.reduce((sum: number, p: any) => sum + (p.duration || 0), 0)} Menit
          </p>
        </div>
      </div>
    </div>
  );
}

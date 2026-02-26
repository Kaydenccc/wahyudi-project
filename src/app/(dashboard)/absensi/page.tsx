"use client";

import { useState } from "react";
import {
  CalendarCheck,
  ClipboardCheck,
  UserX,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/use-schedules";
import { useAthletes } from "@/hooks/use-athletes";
import { useAttendance } from "@/hooks/use-attendance";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

const statusOptions = ["Hadir", "Izin", "Tidak Hadir"] as const;

export default function AbsensiPage() {
  const { user: sessionUser } = useSession();
  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("");

  const { schedules: todaySchedules, isLoading: schedulesLoading } = useSchedules({ date: todayDate });
  const { athletes, isLoading: athletesLoading } = useAthletes({ limit: 50 });
  const { records: attendanceHistory, isLoading: historyLoading, mutate: mutateAttendance } = useAttendance({ search: historySearch, status: historyFilter });
  const { stats: dashStats } = useDashboardStats();

  // Set default selected schedule when schedules load
  const effectiveSelectedSchedule = selectedSchedule || (todaySchedules.length > 0 ? todaySchedules[0]._id : "");

  const markAttendance = (athleteId: string, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [athleteId]: status }));
  };

  const handleSubmitAttendance = async () => {
    if (!effectiveSelectedSchedule) return;
    setSubmitting(true);
    try {
      const records = Object.entries(attendanceData).map(([athleteId, status]) => ({
        athleteId,
        status,
      }));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: effectiveSelectedSchedule,
          date: new Date().toISOString(),
          markedBy: sessionUser?.name || "Pelatih",
          records,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan absensi");
      toast.success("Absensi berhasil disimpan!");
      setAttendanceData({});
      mutateAttendance();
    } catch {
      toast.error("Gagal menyimpan absensi");
    } finally {
      setSubmitting(false);
    }
  };

  const markedCount = Object.keys(attendanceData).length;
  const hadirCount = Object.values(attendanceData).filter((s) => s === "Hadir").length;
  const izinCount = Object.values(attendanceData).filter((s) => s === "Izin").length;
  const absentCount = Object.values(attendanceData).filter((s) => s === "Tidak Hadir").length;
  const currentSchedule = todaySchedules.find((s: any) => s._id === effectiveSelectedSchedule);

  if (schedulesLoading || athletesLoading || historyLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Absensi Latihan"
          description="Tandai kehadiran untuk sesi latihan hari ini dan lihat riwayat kehadiran."
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Latihan"
        description="Tandai kehadiran untuk sesi latihan hari ini dan lihat riwayat kehadiran."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sesi (Bulan)" value={dashStats?.totalSessionsThisMonth || 0} icon={CalendarCheck} />
        <StatCard title="Rata-rata Kehadiran" value={`${dashStats?.avgAttendance || 0}%`} icon={ClipboardCheck} iconColor="text-green-400" />
        <StatCard title="Tidak Hadir Hari Ini" value={absentCount} icon={UserX} iconColor="text-red-400" />
        <StatCard title="Belum Ditandai" value={athletes.length - markedCount} icon={Clock} iconColor="text-yellow-400" />
      </div>

      {/* Mark Attendance Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Tandai Kehadiran - Hari Ini</CardTitle>
            <Select value={effectiveSelectedSchedule} onValueChange={setSelectedSchedule}>
              <SelectTrigger className="w-full sm:w-72 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {todaySchedules.map((s: any) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.program?.name || "Program"} ({s.startTime} - {s.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {currentSchedule?.startTime || "—"} - {currentSchedule?.endTime || "—"}
            </span>
            <span>{currentSchedule?.venue || "—"}</span>
            <span>{currentSchedule?.coach || "—"}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {athletes.map((athlete: any) => (
              <div
                key={athlete._id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {athlete.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{athlete.name}</p>
                    <p className="text-xs text-muted-foreground">{athlete.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => markAttendance(athlete._id, status)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                        attendanceData[athlete._id] === status
                          ? status === "Hadir"
                            ? "bg-green-500/20 border-green-500/40 text-green-400"
                            : status === "Izin"
                              ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                              : "bg-red-500/20 border-red-500/40 text-red-400"
                          : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                Ditandai: <span className="font-semibold text-foreground">{markedCount}/{athletes.length}</span>
              </span>
              <span className="text-green-400">Hadir: {hadirCount}</span>
              <span className="text-yellow-400">Izin: {izinCount}</span>
              <span className="text-red-400">Tidak Hadir: {absentCount}</span>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={markedCount < athletes.length || submitting}
              onClick={handleSubmitAttendance}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {submitting ? "Menyimpan..." : "Simpan Kehadiran"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Riwayat Kehadiran</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari atlet..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-10 w-48 bg-secondary border-border"
              />
            </div>
            <Select value={historyFilter} onValueChange={(v) => setHistoryFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Hadir">Hadir</SelectItem>
                <SelectItem value="Izin">Izin</SelectItem>
                <SelectItem value="Tidak Hadir">Tidak Hadir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tanggal</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atlet</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ditandai Oleh</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record: any, i: number) => {
                  const athleteName = record.athlete?.name || record.athlete || "Unknown";
                  const programName = record.schedule?.program?.name || record.schedule?.program || record.program || "N/A";
                  const recordDate = record.date ? new Date(record.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "";
                  return (
                    <tr key={record._id || i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-3 text-sm text-muted-foreground">{recordDate}</td>
                      <td className="px-6 py-3 text-sm text-foreground">{programName}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {String(athleteName).split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{athleteName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">{record.markedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

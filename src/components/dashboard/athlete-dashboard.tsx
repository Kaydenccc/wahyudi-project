"use client";

import Link from "next/link";
import {
  Activity,
  TrendingUp,
  CalendarCheck,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { useAthletePerformance } from "@/hooks/use-performance";
import { useAthletes } from "@/hooks/use-athletes";
import { useSchedules } from "@/hooks/use-schedules";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface AthleteDashboardProps {
  user: { id: string; name: string; email: string; role: string };
}

export function AthleteDashboard({ user }: AthleteDashboardProps) {
  // Find athlete record by name (User and Athlete are separate models)
  const { athletes } = useAthletes({ search: user.name, limit: 1 });
  const athleteId = athletes.length > 0 ? athletes[0]._id : null;

  const { data, isLoading } = useAthletePerformance(athleteId);
  const { schedules } = useSchedules();

  const athlete = data?.athlete;
  const performances = data?.performances || [];
  const stats = data?.stats || {};
  const recovery = data?.recovery || { overall: 0, sleepScore: 0, hrvStatus: "N/A" };

  const upcomingSchedules = schedules
    .filter((s: any) => s.status === "Terjadwal" || s.status === "Berlangsung")
    .slice(0, 4);

  const latestScore = performances.length > 0 ? performances[0].score : 0;
  const avgScore =
    performances.length > 0
      ? Math.round(performances.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / performances.length)
      : 0;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-primary/30">
              {athlete?.photo && <AvatarImage src={athlete.photo} alt={user.name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-primary font-medium">
                {athlete?.category || "—"} &bull; {athlete?.position || "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selamat datang kembali! Berikut ringkasan performa kamu.
              </p>
            </div>
            {athleteId && (
              <Link href={`/monitoring-performa/${athleteId}`}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Lihat Performa Lengkap
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skor Terakhir</p>
                <p className="text-xl font-bold text-foreground">{latestScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rata-rata Skor</p>
                <p className="text-xl font-bold text-foreground">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kesiapan</p>
                <p className="text-xl font-bold text-foreground">{recovery.overall}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Evaluasi</p>
                <p className="text-xl font-bold text-foreground">{performances.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Performance */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Performa Terbaru</CardTitle>
            {athleteId && (
              <Link href={`/monitoring-performa/${athleteId}`}>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">
                  Selengkapnya →
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {performances.length > 0 ? (
              performances.slice(0, 5).map((p: any, i: number) => (
                <div key={p._id || i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {p.date ? format(new Date(p.date), "d MMM yyyy", { locale: idLocale }) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.type || "Evaluasi"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={p.score} className="w-20 h-2 bg-secondary [&>div]:bg-primary" />
                    <span className="text-sm font-bold text-primary w-8 text-right">{p.score}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Belum ada data performa.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedules */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Jadwal Latihan Mendatang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((s: any) => (
                <div key={s._id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className={cn(
                    "mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                    s.status === "Berlangsung" ? "bg-green-500/10" : "bg-primary/10"
                  )}>
                    {s.status === "Berlangsung" ? (
                      <Clock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Calendar className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {s.program?.name || "Latihan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.date
                        ? format(new Date(s.date), "EEEE, d MMM", { locale: idLocale })
                        : "—"}{" "}
                      &bull; {s.startTime} - {s.endTime}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Tidak ada jadwal mendatang.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stat Details */}
      {(stats.smashSpeed || stats.footworkRating) && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Statistik Teknis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Kec. Smash</p>
                <p className="text-lg font-bold text-foreground">{stats.smashSpeed?.value || 0} <span className="text-xs text-muted-foreground">km/h</span></p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Footwork</p>
                <p className="text-lg font-bold text-foreground">{stats.footworkRating?.value || 0} <span className="text-xs text-muted-foreground">/10</span></p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Prob. Menang</p>
                <p className="text-lg font-bold text-foreground">{stats.winProbability?.value || 0} <span className="text-xs text-muted-foreground">%</span></p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Akurasi Net</p>
                <p className="text-lg font-bold text-foreground">{stats.netAccuracy?.value || 0} <span className="text-xs text-muted-foreground">%</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

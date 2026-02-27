"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { cn } from "@/lib/utils";
import { usePerformance } from "@/hooks/use-performance";
import { useSession } from "@/hooks/use-session";
import { useDebouncedValue } from "@/hooks/use-debounce";

const tabs = ["Semua", "Progres Baik", "Stabil", "Perlu Evaluasi"];

export default function MonitoringPerformaPage() {
  const { user } = useSession();
  const canInput = user?.role === "Admin" || user?.role === "Pelatih";
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const { athletes: athletePerformance, isLoading } = usePerformance({
    search: debouncedSearch,
    status: activeTab === "Semua" ? "" : activeTab,
  });

  const progresBaikCount = athletePerformance.filter((a: any) => a.status === "Progres Baik").length;
  const perluEvaluasiCount = athletePerformance.filter((a: any) => a.status === "Perlu Evaluasi").length;
  const avgScore = athletePerformance.length > 0
    ? Math.round(athletePerformance.reduce((sum: number, a: any) => sum + a.avgScore, 0) / athletePerformance.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Monitoring Performa"
          description="Pantau dan analisis performa atlet di seluruh sesi latihan."
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Monitoring Performa"
          description="Pantau dan analisis performa atlet di seluruh sesi latihan."
        />
        {canInput && (
          <Link href="/monitoring-performa/input">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Input Performa
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rata-rata Skor Performa" value={`${avgScore}/100`} icon={BarChart3} />
        <StatCard title="Progres Baik" value={progresBaikCount} icon={TrendingUp} change="Atlet" changeType="up" iconColor="text-green-400" />
        <StatCard title="Perlu Evaluasi" value={perluEvaluasiCount} icon={TrendingDown} change="Atlet" changeType="down" iconColor="text-red-400" />
        <StatCard title="Total Dievaluasi" value={athletePerformance.length} icon={BarChart3} iconColor="text-blue-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari atlet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Performance Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atlet</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategori</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skor Rata-rata</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tren</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kehadiran</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Penilaian</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {athletePerformance.map((athlete: any) => (
                  <tr key={athlete._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {athlete.photo && (
                            <AvatarImage src={athlete.photo} alt={athlete.name} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {athlete.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">{athlete.name}</p>
                          <p className="text-xs text-muted-foreground">{athlete.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={athlete.category?.toUpperCase() || "PEMULA"} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={athlete.avgScore} className="w-20 h-2 bg-secondary [&>div]:bg-primary" />
                        <span className="text-sm font-bold text-primary">{athlete.avgScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        athlete.trend === "up" ? "text-green-400" : athlete.trend === "down" ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {athlete.trend === "up" ? <TrendingUp className="h-4 w-4" /> : athlete.trend === "down" ? <TrendingDown className="h-4 w-4" /> : null}
                        {athlete.change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{athlete.attendance}%</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={athlete.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/monitoring-performa/${athlete._id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {athletePerformance.length === 0 && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Tidak ada data atlet ditemukan.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

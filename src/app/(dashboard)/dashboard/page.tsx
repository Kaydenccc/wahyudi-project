"use client";

import { Users, CalendarCheck, Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PerformanceTrendChart } from "@/components/dashboard/performance-trend-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { TopPerformersTable } from "@/components/dashboard/top-performers-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AthleteDashboard } from "@/components/dashboard/athlete-dashboard";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useSession } from "@/hooks/use-session";

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats();
  const { user } = useSession();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Dashboard" description="Memuat data..." />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat...</div>
        </div>
      </div>
    );
  }

  // Athlete gets personalized dashboard
  if (user?.role === "Atlet") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Saya"
          description={`Selamat datang, ${user.name}. Berikut ringkasan performa kamu.`}
        />
        <AthleteDashboard user={user} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan Dashboard"
        description={`Selamat datang, ${user?.name || "User"}. Berikut ringkasan hari ini.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Atlet"
          value={stats?.totalAthletes ?? 0}
          icon={Users}
        />
        <StatCard
          title="Rata-rata Kehadiran"
          value={stats?.avgAttendance ? `${stats.avgAttendance}%` : "0%"}
          icon={CalendarCheck}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Performa Terbaik"
          value={stats?.topPerformersCount ?? 0}
          icon={Trophy}
          iconColor="text-yellow-400"
        />
        <StatCard
          title="Penurunan Performa"
          value={stats?.decliningCount ?? 0}
          icon={TrendingDown}
          change="Atlet"
          changeType="down"
          iconColor="text-red-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Tren Performa Bulanan</CardTitle>
              <p className="text-sm text-muted-foreground">Progres keseluruhan klub</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {stats?.performanceTrend && stats.performanceTrend.length > 0
                  ? `${stats.performanceTrend[stats.performanceTrend.length - 1]?.score ?? 0}/100`
                  : "0/100"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <PerformanceTrendChart />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Persentase Kehadiran</CardTitle>
              <p className="text-sm text-muted-foreground">Rincian mingguan bulan ini</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{stats?.avgAttendance ?? 0}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Performa Terbaik</CardTitle>
            <Link href="/monitoring-performa">
              <Button variant="link" className="text-primary p-0 h-auto">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <TopPerformersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

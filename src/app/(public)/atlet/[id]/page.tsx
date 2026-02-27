"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Calendar,
  Ruler,
  Weight,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { usePublicAthlete } from "@/hooks/use-public-data";

interface Achievement {
  _id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  level: string;
  result: string;
  photo: string;
}

interface RecentPerformance {
  date: string;
  score: number;
  type: string;
  trend: string;
  change: number;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getResultStyle(result: string) {
  switch (result) {
    case "Juara 1":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    case "Juara 2":
      return "text-gray-300 bg-gray-500/10 border-gray-500/20";
    case "Juara 3":
      return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "Partisipasi":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    default:
      return "text-muted-foreground bg-muted/50 border-border";
  }
}

function getResultIcon(result: string) {
  switch (result) {
    case "Juara 1":
      return <Trophy className="h-5 w-5 text-yellow-400" />;
    case "Juara 2":
      return <Medal className="h-5 w-5 text-gray-300" />;
    case "Juara 3":
      return <Medal className="h-5 w-5 text-orange-400" />;
    default:
      return <Award className="h-5 w-5 text-blue-400" />;
  }
}

export default function PublicAtletDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { athlete, achievements, performance, isLoading } =
    usePublicAthlete(id);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Link
            href="/atlet"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Atlet
          </Link>
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Memuat...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 State
  if (!athlete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Link
            href="/atlet"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Atlet
          </Link>
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Atlet tidak ditemukan
              </h3>
              <p className="text-sm text-muted-foreground">
                Atlet yang Anda cari tidak tersedia atau telah dihapus.
              </p>
            </div>
            <Link href="/atlet">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar Atlet
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = athlete.name
    ? athlete.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Back Link */}
        <Link
          href="/atlet"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Atlet
        </Link>

        {/* Profile Header Card */}
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar / Photo */}
              <div className="flex-shrink-0 flex justify-center md:justify-start">
                {athlete.photo ? (
                  <div className="h-[120px] w-[120px] rounded-full overflow-hidden border-4 border-primary/20">
                    <Image
                      src={athlete.photo}
                      alt={athlete.name}
                      width={120}
                      height={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <Avatar className="h-[120px] w-[120px] border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {athlete.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <StatusBadge status={athlete.category} />
                    {athlete.position && (
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground"
                      >
                        {athlete.position}
                      </Badge>
                    )}
                    {athlete.status && (
                      <StatusBadge status={athlete.status} />
                    )}
                  </div>
                </div>

                {/* Physical Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
                  {athlete.age != null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span>{athlete.age} tahun</span>
                    </div>
                  )}
                  {athlete.gender && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span>{athlete.gender}</span>
                    </div>
                  )}
                  {athlete.height != null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ruler className="h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span>{athlete.height} cm</span>
                    </div>
                  )}
                  {athlete.weight != null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Weight className="h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span>{athlete.weight} kg</span>
                    </div>
                  )}
                  {athlete.joinDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span>Sejak {formatDate(athlete.joinDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rata-rata Performa */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Rata-rata Performa
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {performance.avgScore}
                    <span className="text-sm font-normal text-muted-foreground">
                      /100
                    </span>
                  </p>
                </div>
              </div>
              <Progress
                value={performance.avgScore}
                className="h-2 bg-secondary [&>div]:bg-blue-500"
              />
            </CardContent>
          </Card>

          {/* Kehadiran */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Kehadiran (30 hari)
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {performance.attendance}
                    <span className="text-sm font-normal text-muted-foreground">
                      %
                    </span>
                  </p>
                </div>
              </div>
              <Progress
                value={performance.attendance}
                className="h-2 bg-secondary [&>div]:bg-green-500"
              />
            </CardContent>
          </Card>

          {/* Total Prestasi */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Total Prestasi
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {achievements.length}
                  </p>
                </div>
              </div>
              <div className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Prestasi & Penghargaan
            </h2>
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement: Achievement) => (
                <Card
                  key={achievement._id}
                  className="border-border bg-card hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                          achievement.result === "Juara 1"
                            ? "bg-yellow-500/10"
                            : achievement.result === "Juara 2"
                              ? "bg-gray-500/10"
                              : achievement.result === "Juara 3"
                                ? "bg-orange-500/10"
                                : "bg-blue-500/10"
                        }`}
                      >
                        {getResultIcon(achievement.result)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {achievement.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(achievement.date)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {achievement.category && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-border text-muted-foreground"
                            >
                              {achievement.category}
                            </Badge>
                          )}
                          {achievement.level && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-border text-muted-foreground"
                            >
                              {achievement.level}
                            </Badge>
                          )}
                          {achievement.result && (
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getResultStyle(achievement.result)}`}
                            >
                              {achievement.result}
                            </span>
                          )}
                        </div>

                        {achievement.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {achievement.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Belum ada prestasi tercatat
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Performance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Performa Terkini
            </h2>
          </div>

          {performance.recent && performance.recent.length > 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-3">
                {performance.recent.map(
                  (entry: RecentPerformance, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      {/* Date */}
                      <div className="flex-shrink-0 w-28">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(entry.date)}
                        </p>
                      </div>

                      {/* Score with Progress Bar */}
                      <div className="flex-1 flex items-center gap-3">
                        <Progress
                          value={entry.score}
                          className="flex-1 h-2 bg-secondary [&>div]:bg-primary"
                        />
                        <span className="text-sm font-bold text-primary min-w-[45px] text-right">
                          {entry.score}/100
                        </span>
                      </div>

                      {/* Type Badge */}
                      {entry.type && (
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground text-[10px] flex-shrink-0"
                        >
                          {entry.type}
                        </Badge>
                      )}

                      {/* Trend Arrow + Change */}
                      <div className="flex items-center gap-1 flex-shrink-0 min-w-[60px] justify-end">
                        {entry.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : entry.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        ) : (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <div className="h-0.5 w-3 bg-muted-foreground rounded" />
                          </div>
                        )}
                        <span
                          className={`text-xs font-medium ${
                            entry.trend === "up"
                              ? "text-green-400"
                              : entry.trend === "down"
                                ? "text-red-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {entry.change > 0 ? "+" : ""}
                          {entry.change}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Target className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Belum ada data performa
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users,
  BookOpen,
  Trophy,
  Medal,
  Globe,
  ArrowRight,
  Star,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePublicClub } from "@/hooks/use-public-data";

function getResultColor(result: string) {
  switch (result) {
    case "Juara 1":
      return {
        icon: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-500",
      };
    case "Juara 2":
      return {
        icon: "text-gray-300",
        bg: "bg-gray-400/10",
        border: "border-gray-400/20",
        text: "text-gray-400",
      };
    case "Juara 3":
      return {
        icon: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-500",
      };
    case "Partisipasi":
      return {
        icon: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        text: "text-blue-400",
      };
    default:
      return {
        icon: "text-muted-foreground",
        bg: "bg-muted/50",
        border: "border-border",
        text: "text-muted-foreground",
      };
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ResultIcon({ result }: { result: string }) {
  const colors = getResultColor(result);
  if (result === "Juara 1" || result === "Juara 2" || result === "Juara 3") {
    return <Trophy className={`size-5 ${colors.icon}`} />;
  }
  if (result === "Partisipasi") {
    return <Medal className={`size-5 ${colors.icon}`} />;
  }
  return <Award className={`size-5 ${colors.icon}`} />;
}

// --- Loading Skeleton ---
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="size-24 rounded-2xl bg-muted/50 animate-pulse" />
            <div className="space-y-3 flex flex-col items-center">
              <div className="h-9 w-64 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-5 w-80 bg-muted/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function KlubPage() {
  const { club, stats, featuredAthletes, recentAchievements, isLoading } =
    usePublicClub();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Club logo */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/60 to-primary/20 blur-sm group-hover:blur-md transition-all duration-500" />
              <div className="relative size-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 bg-card">
                <Image
                  src={club?.logo || "/logo.jpeg"}
                  alt={club?.clubName || "Logo Klub"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Club name */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {club?.clubName || "Klub Bulutangkis"}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
                Sistem Pembinaan Atlet Bulutangkis
              </p>
            </div>

            {/* Website link */}
            {club?.website && (
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
              >
                <Globe className="size-4 text-primary" />
                <span>{club.website.replace(/^https?:\/\//, "")}</span>
                <ArrowRight className="size-3" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ===== SEJARAH SECTION ===== */}
      {club?.history && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Sejarah Klub
                </h2>
                <p className="text-sm text-muted-foreground">
                  Perjalanan {club?.clubName || "Klub"}
                </p>
              </div>
            </div>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="py-6">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {club.history}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* ===== VISI & MISI SECTION ===== */}
      {(club?.vision || club?.mission) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-blue-500/10">
                <Star className="size-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Visi & Misi
                </h2>
                <p className="text-sm text-muted-foreground">
                  Arah dan tujuan pembinaan
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {club?.vision && (
                <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
                  <CardContent className="py-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Visi</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {club.vision}
                    </p>
                  </CardContent>
                </Card>
              )}
              {club?.mission && (
                <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 via-blue-500/30 to-transparent" />
                  <CardContent className="py-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Misi</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {club.mission}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== STATISTICS SECTION ===== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Atlet Aktif */}
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 size-20 rounded-full bg-green-500/5 -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors" />
            <CardContent className="flex items-center gap-4 py-2">
              <div className="flex items-center justify-center size-12 rounded-xl bg-green-500/10 text-green-500 shrink-0">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalAthletes}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Atlet Aktif
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Program Latihan */}
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 size-20 rounded-full bg-blue-500/5 -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
            <CardContent className="flex items-center gap-4 py-2">
              <div className="flex items-center justify-center size-12 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <BookOpen className="size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalPrograms}
                </p>
                <p className="text-sm text-muted-foreground">Program Latihan</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Prestasi */}
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 size-20 rounded-full bg-yellow-500/5 -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/10 transition-colors" />
            <CardContent className="flex items-center gap-4 py-2">
              <div className="flex items-center justify-center size-12 rounded-xl bg-yellow-500/10 text-yellow-500 shrink-0">
                <Trophy className="size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalAchievements}
                </p>
                <p className="text-sm text-muted-foreground">Total Prestasi</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== FEATURED ATHLETES SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="space-y-8">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <Star className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Atlet Unggulan
              </h2>
              <p className="text-sm text-muted-foreground">
                Atlet berprestasi di klub kami
              </p>
            </div>
          </div>

          {/* Athletes grid */}
          {featuredAthletes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredAthletes.map(
                (athlete: {
                  _id: string;
                  name: string;
                  category: string;
                  position: string;
                  photo?: string;
                  achievementCount: number;
                }) => (
                  <Link
                    key={athlete._id}
                    href={`/atlet/${athlete._id}`}
                    className="group"
                  >
                    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                      {/* Decorative gradient */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardContent className="flex items-center gap-4 py-2">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Avatar className="relative size-14 ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300">
                            {athlete.photo && (
                              <AvatarImage
                                src={athlete.photo}
                                alt={athlete.name}
                              />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {getInitials(athlete.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                            {athlete.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              {athlete.category}
                            </Badge>
                            {athlete.position && (
                              <span className="text-xs text-muted-foreground truncate">
                                {athlete.position}
                              </span>
                            )}
                          </div>
                          {athlete.achievementCount > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                              <Trophy className="size-3.5 text-yellow-500" />
                              <span>
                                {athlete.achievementCount} prestasi
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                )
              )}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Belum ada atlet unggulan untuk ditampilkan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ===== RECENT ACHIEVEMENTS SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="space-y-8">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-yellow-500/10">
              <Trophy className="size-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Prestasi Terbaru
              </h2>
              <p className="text-sm text-muted-foreground">
                Pencapaian terkini dari atlet kami
              </p>
            </div>
          </div>

          {/* Achievements grid */}
          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {recentAchievements.map(
                (achievement: {
                  _id: string;
                  title: string;
                  date: string;
                  category: string;
                  level: string;
                  result: string;
                  athlete: { name: string; photo?: string };
                }) => {
                  const resultStyle = getResultColor(achievement.result);
                  return (
                    <Card
                      key={achievement._id}
                      className={`relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-all duration-300 group`}
                    >
                      {/* Result accent line */}
                      <div
                        className={`absolute top-0 left-0 bottom-0 w-1 ${resultStyle.bg}`}
                        style={{
                          background:
                            achievement.result === "Juara 1"
                              ? "linear-gradient(to bottom, rgb(250 204 21), rgb(234 179 8))"
                              : achievement.result === "Juara 2"
                                ? "linear-gradient(to bottom, rgb(209 213 219), rgb(156 163 175))"
                                : achievement.result === "Juara 3"
                                  ? "linear-gradient(to bottom, rgb(251 146 60), rgb(249 115 22))"
                                  : achievement.result === "Partisipasi"
                                    ? "linear-gradient(to bottom, rgb(96 165 250), rgb(59 130 246))"
                                    : "linear-gradient(to bottom, rgb(163 163 163), rgb(115 115 115))",
                        }}
                      />

                      <CardContent className="flex items-start gap-4 py-3 pl-8">
                        {/* Result icon */}
                        <div
                          className={`flex items-center justify-center size-10 rounded-xl ${resultStyle.bg} shrink-0 mt-0.5`}
                        >
                          <ResultIcon result={achievement.result} />
                        </div>

                        {/* Achievement details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="font-semibold text-foreground leading-tight">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {formatDate(achievement.date)}
                            </p>
                          </div>

                          {/* Athlete info */}
                          <div className="flex items-center gap-2">
                            <Avatar className="size-5">
                              {achievement.athlete?.photo && (
                                <AvatarImage
                                  src={achievement.athlete.photo}
                                  alt={achievement.athlete.name}
                                />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                                {getInitials(
                                  achievement.athlete?.name || "?"
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground truncate">
                              {achievement.athlete?.name}
                            </span>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-xs ${resultStyle.text} ${resultStyle.border}`}
                            >
                              {achievement.result}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {achievement.level}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {achievement.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Belum ada prestasi untuk ditampilkan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10">
              <Award className="size-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Jelajahi Lebih Lanjut
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Lihat profil lengkap atlet kami atau masuk ke dashboard untuk
                mengelola data pembinaan.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link href="/atlet">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]"
                >
                  <Users className="size-4" />
                  Lihat Semua Atlet
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  Masuk Dashboard
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

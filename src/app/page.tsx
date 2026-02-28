"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, BookOpen, Trophy, BarChart3, Calendar, FileText, ArrowRight, Star, Award, LogIn, Handshake, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePublicClub } from "@/hooks/use-public-data";
import { useBranding } from "@/hooks/use-branding";
import { PublicNavbar } from "@/components/public/public-navbar";
import { PublicFooter } from "@/components/public/public-footer";

const features = [
  {
    icon: BarChart3,
    title: "Monitoring Performa",
    description: "Pantau perkembangan dan performa atlet secara real-time dengan data terukur.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Calendar,
    title: "Program Latihan",
    description: "Kelola jadwal dan program latihan terstruktur untuk setiap kategori atlet.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Trophy,
    title: "Pencatatan Prestasi",
    description: "Dokumentasikan setiap pencapaian dan prestasi atlet dari tingkat daerah hingga internasional.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: FileText,
    title: "Laporan Komprehensif",
    description: "Generate laporan lengkap untuk evaluasi dan pengambilan keputusan pembinaan.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export default function LandingPage() {
  const { branding } = useBranding();
  const { club, stats, featuredAthletes, isLoading } = usePublicClub();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/40 to-primary/10 rounded-3xl blur-lg" />
              <Image
                src={branding.logo || "/logo.jpeg"}
                alt={branding.clubName}
                width={96}
                height={96}
                className="relative rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight">
            {branding.clubName}
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-semibold text-primary tracking-widest uppercase">
            Badminton
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistem Pembinaan Atlet Bulutangkis — Mencetak atlet berprestasi melalui pembinaan terstruktur dan profesional.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/klub">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                <Star className="h-4 w-4 mr-2" />
                Profil Klub
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                <LogIn className="h-4 w-4 mr-2" />
                Masuk Dashboard
              </Button>
            </Link>
            <Link href="/dokumentasi">
              <Button size="lg" variant="outline" className="px-8">
                <BookOpen className="h-4 w-4 mr-2" />
                Panduan Penggunaan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-6 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Atlet Aktif", value: stats.totalAthletes, icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Program Latihan", value: stats.totalPrograms, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Total Prestasi", value: stats.totalAchievements, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-all"
            >
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "-" : stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Athletes */}
      {featuredAthletes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              Atlet Unggulan
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Para Atlet Kami
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Mengenal lebih dekat atlet-atlet berprestasi yang menjadi kebanggaan klub.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredAthletes.map((athlete: any) => (
              <Link
                key={athlete._id}
                href={`/atlet/${athlete._id}`}
                className="group bg-card border border-border/50 rounded-xl p-5 text-center hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <Avatar className="h-16 w-16 mx-auto ring-2 ring-border group-hover:ring-primary/40 transition-all">
                  {athlete.photo ? (
                    <Image src={athlete.photo} alt={athlete.name} width={64} height={64} className="rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {athlete.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="mt-3 font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                  {athlete.name}
                </p>
                <p className="text-xs text-muted-foreground">{athlete.category}</p>
                {athlete.achievementCount > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-yellow-400">
                    <Trophy className="h-3 w-3" />
                    {athlete.achievementCount}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/atlet">
              <Button variant="outline" size="lg">
                Lihat Semua Atlet
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              Fitur Unggulan
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Sistem terintegrasi untuk mendukung pembinaan atlet bulutangkis secara profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 hover:-translate-y-1 transition-all"
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${feature.bg} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Section */}
      {club?.sponsors && club.sponsors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Handshake className="h-4 w-4" />
              Sponsor & Mitra
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Didukung Oleh
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Mitra dan sponsor yang mendukung pembinaan atlet kami.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {club.sponsors.map((sponsor: { _id: string; name: string; logo: string; website?: string }) => {
              const card = (
                <div
                  key={sponsor._id}
                  className="group flex flex-col items-center gap-3 p-6 bg-card border border-border/50 rounded-xl hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all"
                >
                  <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-background/50 border border-border/30 flex items-center justify-center p-2 group-hover:border-primary/20 transition-colors">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      fill
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors text-center">
                    {sponsor.name}
                    {sponsor.website && (
                      <ExternalLink className="inline-block size-3 text-muted-foreground/50 ml-1 group-hover:text-primary/60 transition-colors" />
                    )}
                  </p>
                </div>
              );

              if (sponsor.website) {
                return (
                  <a key={sponsor._id} href={sponsor.website} target="_blank" rel="noopener noreferrer">
                    {card}
                  </a>
                );
              }
              return card;
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-border/50 rounded-2xl p-12">
          <Award className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Bergabung Bersama Kami
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Daftarkan diri Anda dan mulai perjalanan menjadi atlet bulutangkis berprestasi.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/atlet">
              <Button size="lg" variant="outline" className="px-8">
                Lihat Daftar Atlet
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

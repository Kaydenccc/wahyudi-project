"use client";

import Link from "next/link";
import Image from "next/image";
import { useBranding } from "@/hooks/use-branding";

export function PublicFooter() {
  const { branding } = useBranding();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={branding.logo || "/logo.jpeg"}
                alt={branding.clubName}
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <p className="font-bold text-foreground">{branding.clubName}</p>
                <p className="text-xs text-muted-foreground">Sistem Pembinaan Atlet Bulutangkis</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mencetak atlet bulutangkis berprestasi melalui pembinaan yang terstruktur dan profesional.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Navigasi</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Beranda
              </Link>
              <Link href="/klub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Profil Klub
              </Link>
              <Link href="/atlet" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Daftar Atlet
              </Link>
            </div>
          </div>

          {/* Akses */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Akses</h3>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Masuk Dashboard
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Daftar Akun
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {branding.clubName}. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

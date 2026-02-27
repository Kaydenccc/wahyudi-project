"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/use-branding";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Profil Klub", href: "/klub" },
  { label: "Daftar Atlet", href: "/atlet" },
];

export function PublicNavbar() {
  const { branding } = useBranding();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={branding.logo || "/logo.jpeg"}
              alt={branding.clubName}
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-foreground hidden sm:block">
              {branding.clubName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <LogIn className="h-4 w-4 mr-2" />
                Masuk
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

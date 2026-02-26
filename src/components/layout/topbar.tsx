"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Menu, LogOut, Sun, Moon, X, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sidebar } from "./sidebar";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "next-themes";
import { useSchedules } from "@/hooks/use-schedules";
import { cn } from "@/lib/utils";

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { schedules } = useSchedules();

  useEffect(() => setMounted(true), []);

  // Close search results on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search athletes with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/athletes?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.athletes || []);
          setShowResults(true);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Upcoming schedules for notifications
  const upcomingSchedules = schedules
    .filter((s: any) => s.status === "Terjadwal" || s.status === "Berlangsung")
    .slice(0, 5);

  const notifCount = upcomingSchedules.length;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const handleSelectAthlete = (athleteId: string) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(`/data-atlet/${athleteId}`);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari atlet..."
            className="pl-10 pr-8 bg-secondary border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-[100]">
              {searching ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">Mencari...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((athlete: any) => (
                  <button
                    key={athlete._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectAthlete(athlete._id);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {athlete.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{athlete.name}</p>
                      <p className="text-xs text-muted-foreground">{athlete.category} &bull; {athlete.position}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Tidak ada hasil untuk &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title="Ganti tema"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Notification Bell */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 bg-card border-border">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Notifikasi</p>
              <p className="text-xs text-muted-foreground">Jadwal latihan mendatang</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {upcomingSchedules.length > 0 ? (
                upcomingSchedules.map((s: any) => {
                  const canNav = user?.role === "Admin" || user?.role === "Pelatih";
                  const Wrapper = canNav ? "button" : "div";
                  return (
                    <Wrapper
                      key={s._id}
                      {...(canNav ? {
                        onClick: () => { setNotifOpen(false); router.push("/program-latihan/jadwal"); },
                      } : {})}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 w-full text-left",
                        canNav && "hover:bg-secondary/50 cursor-pointer transition-colors"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
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
                          {s.date ? new Date(s.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }) : ""} &bull; {s.startTime} - {s.endTime}
                        </p>
                        <span className={cn(
                          "text-[10px] font-medium",
                          s.status === "Berlangsung" ? "text-green-500" : "text-primary"
                        )}>
                          {s.status}
                        </span>
                      </div>
                    </Wrapper>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Tidak ada jadwal mendatang
                </div>
              )}
            </div>
            {upcomingSchedules.length > 0 && (user?.role === "Admin" || user?.role === "Pelatih") && (
              <div className="px-4 py-2 border-t border-border">
                <button
                  onClick={() => { setNotifOpen(false); router.push("/program-latihan/jadwal"); }}
                  className="text-xs text-primary hover:underline"
                >
                  Lihat semua jadwal →
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Link
          href="/profil"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 -mr-1 hover:bg-secondary/50 transition-colors"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground leading-tight">
              {user?.name || "Memuat..."}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              {user?.role || ""}
            </span>
          </div>

          <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          title="Keluar"
          className="text-muted-foreground hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

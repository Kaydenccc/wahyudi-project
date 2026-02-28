"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  BarChart3,
  Trophy,
  Calendar,
  ClipboardCheck,
  FileText,
  Settings,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Shield,
  ChevronRight,
  ArrowRight,
  Search,
  Moon,
  Sun,
  Bell,
  ListChecks,
  UserCircle,
  ChevronUp,
  Menu,
  X,
  HelpCircle,
  ChevronDown,
  Download,
  Eye,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ──────────────── DATA ──────────────── */

const tocSections = [
  { id: "memulai", label: "Memulai", icon: LogIn },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "data-atlet", label: "Data Atlet", icon: Users },
  { id: "program-latihan", label: "Program Latihan", icon: BookOpen },
  { id: "jadwal-latihan", label: "Jadwal Latihan", icon: Calendar },
  { id: "absensi", label: "Absensi", icon: ClipboardCheck },
  { id: "monitoring-performa", label: "Monitoring Performa", icon: BarChart3 },
  { id: "prestasi", label: "Prestasi", icon: Trophy },
  { id: "laporan", label: "Laporan", icon: FileText },
  { id: "pengaturan", label: "Pengaturan", icon: Settings },
  { id: "hak-akses", label: "Hak Akses", icon: Shield },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

const rolePermissions = [
  {
    module: "Dashboard",
    admin: "full",
    pelatih: "full",
    ketua: "full",
    atlet: "own",
  },
  {
    module: "Data Atlet",
    admin: "full",
    pelatih: "full",
    ketua: "read",
    atlet: "none",
  },
  {
    module: "Program Latihan",
    admin: "full",
    pelatih: "full",
    ketua: "none",
    atlet: "none",
  },
  {
    module: "Jadwal Latihan",
    admin: "full",
    pelatih: "full",
    ketua: "none",
    atlet: "none",
  },
  {
    module: "Absensi",
    admin: "full",
    pelatih: "full",
    ketua: "none",
    atlet: "none",
  },
  {
    module: "Monitoring Performa",
    admin: "full",
    pelatih: "full",
    ketua: "read",
    atlet: "own",
  },
  {
    module: "Prestasi",
    admin: "full",
    pelatih: "full",
    ketua: "read",
    atlet: "own",
  },
  {
    module: "Laporan",
    admin: "full",
    pelatih: "full",
    ketua: "read",
    atlet: "none",
  },
  {
    module: "Pengaturan",
    admin: "full",
    pelatih: "none",
    ketua: "full",
    atlet: "none",
  },
  {
    module: "Profil Saya",
    admin: "full",
    pelatih: "full",
    ketua: "full",
    atlet: "full",
  },
];

const faqs = [
  {
    q: "Bagaimana cara mendaftarkan akun baru?",
    a: 'Klik tombol "Daftar" pada halaman login atau kunjungi halaman registrasi. Isi formulir dengan nama lengkap, email, dan password. Setelah mendaftar, Admin akan menetapkan role yang sesuai untuk akun Anda.',
  },
  {
    q: "Saya lupa password, bagaimana cara mengatasinya?",
    a: "Silakan hubungi Admin klub Anda untuk melakukan reset password. Admin dapat mengatur ulang password melalui menu Pengaturan.",
  },
  {
    q: "Mengapa saya tidak bisa mengakses beberapa menu?",
    a: "Setiap role memiliki hak akses yang berbeda. Lihat tabel Hak Akses di dokumentasi ini untuk mengetahui fitur apa saja yang tersedia untuk role Anda.",
  },
  {
    q: "Bagaimana cara mencetak laporan dalam format PDF?",
    a: 'Buka menu Laporan, pilih jenis laporan yang diinginkan (atlet, performa, atau kehadiran), lalu klik tombol "Export PDF" untuk mengunduh laporan.',
  },
  {
    q: "Apakah data atlet aman?",
    a: "Ya. Sistem menggunakan enkripsi password, otentikasi berbasis JWT, dan kontrol akses berbasis role (RBAC) untuk melindungi data. Informasi kontak atlet juga disembunyikan di halaman publik.",
  },
  {
    q: "Bisakah sistem diakses dari perangkat mobile?",
    a: "Ya. Sistem ini didesain responsif dan dapat diakses dengan baik melalui browser di smartphone, tablet, maupun desktop.",
  },
];

/* ──────────────── PERMISSION BADGE ──────────────── */

function PermissionBadge({ level }: { level: string }) {
  switch (level) {
    case "full":
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px] font-medium">
          Penuh
        </Badge>
      );
    case "read":
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[11px] font-medium">
          Lihat
        </Badge>
      );
    case "own":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[11px] font-medium">
          Sendiri
        </Badge>
      );
    default:
      return (
        <Badge className="bg-muted/50 text-muted-foreground border-border text-[11px] font-medium">
          —
        </Badge>
      );
  }
}

/* ──────────────── STEP CARD ──────────────── */

function StepCard({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: typeof LogIn;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
          {number}
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="size-4 text-primary" />
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ──────────────── FEATURE SECTION ──────────────── */

function FeatureSection({
  id,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: typeof BookOpen;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "flex items-center justify-center size-10 rounded-xl",
            iconBg
          )}
        >
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="py-6 space-y-4">{children}</CardContent>
      </Card>
    </section>
  );
}

/* ──────────────── FAQ ITEM ──────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="font-medium text-foreground text-sm sm:text-base pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

/* ──────────────── INLINE TIP ──────────────── */

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
      <div className="flex items-center justify-center size-6 rounded-lg bg-primary/10 shrink-0 mt-0.5">
        <BookOpen className="size-3.5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}

/* ──────────────── CAPABILITY LIST ──────────────── */

function CapabilityList({ items }: { items: { icon: typeof Eye; text: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <item.icon className="size-4 text-primary shrink-0 mt-0.5" />
          <span className="text-sm text-muted-foreground">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */

export default function DokumentasiPage() {
  const [activeSection, setActiveSection] = useState("memulai");
  const [tocOpen, setTocOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    tocSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Show scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-10 right-10 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10">
              <BookOpen className="size-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                Panduan Penggunaan
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Dokumentasi lengkap tatacara penggunaan Sistem Pembinaan Atlet
                Bulutangkis. Panduan ini akan membantu Anda memahami setiap fitur
                yang tersedia.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="text-xs font-medium px-3 py-1"
              >
                <BookOpen className="size-3 mr-1.5" />
                {tocSections.length} Bagian
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs font-medium px-3 py-1"
              >
                <HelpCircle className="size-3 mr-1.5" />
                {faqs.length} FAQ
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ===== CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* --- Sidebar TOC (desktop) --- */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Daftar Isi
              </p>
              {tocSections.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setTocOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {s.label}
                  </a>
                );
              })}
            </div>
          </aside>

          {/* --- Mobile TOC toggle --- */}
          <div className="fixed bottom-6 right-6 z-50 lg:hidden flex flex-col items-end gap-2">
            {showScrollTop && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center justify-center size-12 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronUp className="size-5" />
              </button>
            )}
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              {tocOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>

          {/* --- Mobile TOC panel --- */}
          {tocOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setTocOpen(false)}
              />
              <div className="absolute bottom-24 right-6 w-64 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Daftar Isi
                </p>
                {tocSections.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeSection === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setTocOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {s.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- Main content --- */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* ──── 1. MEMULAI ──── */}
            <section id="memulai" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                  <LogIn className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Memulai
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Langkah awal menggunakan sistem
                  </p>
                </div>
              </div>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="py-6 space-y-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Untuk mulai menggunakan sistem, Anda perlu memiliki akun
                    terlebih dahulu. Berikut adalah langkah-langkah untuk
                    memulai:
                  </p>

                  <div className="space-y-0">
                    <StepCard
                      number={1}
                      title="Buat Akun"
                      description='Kunjungi halaman Registrasi dan isi formulir pendaftaran dengan nama lengkap, alamat email, dan password. Klik tombol "Daftar" untuk menyelesaikan proses.'
                      icon={UserPlus}
                    />
                    <StepCard
                      number={2}
                      title="Masuk ke Sistem"
                      description='Setelah akun terdaftar, buka halaman Login dan masukkan email serta password Anda. Klik "Masuk" untuk mengakses dashboard.'
                      icon={LogIn}
                    />
                    <StepCard
                      number={3}
                      title="Kenali Dashboard"
                      description="Setelah berhasil masuk, Anda akan diarahkan ke halaman Dashboard. Di sini Anda dapat melihat ringkasan statistik, menu navigasi di sidebar kiri, dan berbagai fitur sesuai role Anda."
                      icon={LayoutDashboard}
                    />
                    <StepCard
                      number={4}
                      title="Jelajahi Fitur"
                      description="Gunakan menu sidebar untuk mengakses fitur-fitur seperti Data Atlet, Program Latihan, Absensi, Monitoring Performa, dan lainnya sesuai hak akses role Anda."
                      icon={BookOpen}
                    />
                  </div>

                  <Tip>
                    Sistem mendukung 4 role pengguna:{" "}
                    <strong>Admin</strong>,{" "}
                    <strong>Pelatih</strong>,{" "}
                    <strong>Ketua Klub</strong>, dan{" "}
                    <strong>Atlet</strong>. Setiap role memiliki akses fitur
                    yang berbeda. Lihat bagian{" "}
                    <a
                      href="#hak-akses"
                      className="text-primary hover:underline"
                    >
                      Hak Akses
                    </a>{" "}
                    untuk detail lengkap.
                  </Tip>
                </CardContent>
              </Card>
            </section>

            {/* ──── 2. DASHBOARD ──── */}
            <FeatureSection
              id="dashboard"
              icon={LayoutDashboard}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              title="Dashboard"
              subtitle="Ringkasan statistik dan informasi terkini"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dashboard adalah halaman utama setelah login. Halaman ini
                menampilkan ringkasan data penting dari seluruh sistem secara
                real-time.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Informasi yang Ditampilkan:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Users,
                    text: "Jumlah total atlet aktif yang terdaftar",
                  },
                  {
                    icon: Calendar,
                    text: "Jadwal latihan mendatang dan yang sedang berlangsung",
                  },
                  {
                    icon: Trophy,
                    text: "Jumlah total prestasi yang telah dicapai",
                  },
                  {
                    icon: BarChart3,
                    text: "Grafik tren performa dan kehadiran atlet",
                  },
                  {
                    icon: ListChecks,
                    text: "Tabel atlet dengan performa terbaik",
                  },
                  {
                    icon: ArrowRight,
                    text: "Quick action shortcuts untuk navigasi cepat",
                  },
                ]}
              />

              <Tip>
                Untuk role <strong>Atlet</strong>, dashboard menampilkan data
                personal seperti riwayat performa, statistik kehadiran, dan
                prestasi pribadi.
              </Tip>
            </FeatureSection>

            {/* ──── 3. DATA ATLET ──── */}
            <FeatureSection
              id="data-atlet"
              icon={Users}
              iconColor="text-green-500"
              iconBg="bg-green-500/10"
              title="Data Atlet"
              subtitle="Kelola informasi lengkap para atlet"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modul ini digunakan untuk mengelola seluruh data atlet yang
                terdaftar di klub. Anda dapat menambah, mengedit, dan menghapus
                data atlet.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Fitur yang Tersedia:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Plus,
                    text: "Tambah atlet baru dengan informasi biodata lengkap",
                  },
                  {
                    icon: Edit3,
                    text: "Edit data atlet (nama, kategori, posisi, status)",
                  },
                  {
                    icon: Eye,
                    text: "Lihat detail profil atlet termasuk foto dan riwayat cedera",
                  },
                  {
                    icon: Search,
                    text: "Cari dan filter atlet berdasarkan nama, kategori, atau status",
                  },
                  {
                    icon: Trash2,
                    text: "Hapus data atlet yang sudah tidak aktif",
                  },
                  {
                    icon: ClipboardCheck,
                    text: "Kelola riwayat cedera atlet (tambah, perbarui status)",
                  },
                ]}
              />

              <div className="pt-2">
                <h3 className="font-semibold text-foreground text-sm mb-2">
                  Kategori Atlet:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Pra Usia Dini",
                    "Usia Dini",
                    "Anak-anak",
                    "Pemula",
                    "Remaja",
                    "Taruna",
                    "Dewasa",
                  ].map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="text-xs"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <Tip>
                Gunakan fitur pencarian di topbar dashboard untuk menemukan
                atlet dengan cepat dari halaman manapun.
              </Tip>
            </FeatureSection>

            {/* ──── 4. PROGRAM LATIHAN ──── */}
            <FeatureSection
              id="program-latihan"
              icon={BookOpen}
              iconColor="text-blue-500"
              iconBg="bg-blue-500/10"
              title="Program Latihan"
              subtitle="Rancang dan kelola program latihan terstruktur"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fitur ini memungkinkan pelatih untuk membuat dan mengelola
                program latihan yang terstruktur. Setiap program dapat berisi
                daftar drill/latihan dengan detail instruksi.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Cara Penggunaan:
              </h3>
              <div className="space-y-0">
                <StepCard
                  number={1}
                  title="Buat Program Baru"
                  description='Klik tombol "Tambah Program", isi nama program, pilih jenis (Teknik/Fisik/Taktik), dan tambahkan deskripsi.'
                  icon={Plus}
                />
                <StepCard
                  number={2}
                  title="Tambahkan Drill"
                  description="Di dalam setiap program, tambahkan drill/latihan spesifik. Isi nama drill, durasi, dan instruksi pelaksanaan."
                  icon={ListChecks}
                />
                <StepCard
                  number={3}
                  title="Kelola Program"
                  description="Anda dapat mengedit, menghapus, atau melihat detail program kapan saja. Program yang dibuat akan tersedia untuk dijadwalkan."
                  icon={Edit3}
                />
              </div>

              <div className="pt-2">
                <h3 className="font-semibold text-foreground text-sm mb-2">
                  Jenis Program:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Teknik", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                    { label: "Fisik", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
                    { label: "Taktik", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
                  ].map((type) => (
                    <Badge
                      key={type.label}
                      className={cn("text-xs", type.color)}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </FeatureSection>

            {/* ──── 5. JADWAL LATIHAN ──── */}
            <FeatureSection
              id="jadwal-latihan"
              icon={Calendar}
              iconColor="text-indigo-500"
              iconBg="bg-indigo-500/10"
              title="Jadwal Latihan"
              subtitle="Atur jadwal latihan untuk setiap program"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modul ini digunakan untuk membuat dan mengelola jadwal latihan
                berdasarkan program yang telah dibuat. Jadwal menentukan kapan
                dan di mana latihan dilaksanakan.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Fitur yang Tersedia:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Plus,
                    text: "Buat jadwal baru dengan memilih program, tanggal, waktu, dan lokasi",
                  },
                  {
                    icon: Eye,
                    text: "Lihat semua jadwal dalam tampilan daftar",
                  },
                  {
                    icon: Edit3,
                    text: "Ubah status jadwal (Terjadwal, Berlangsung, Selesai, Dibatalkan)",
                  },
                  {
                    icon: Bell,
                    text: "Notifikasi otomatis untuk jadwal yang akan datang di topbar",
                  },
                ]}
              />

              <Tip>
                Jadwal yang berstatus <strong>Terjadwal</strong> atau{" "}
                <strong>Berlangsung</strong> akan muncul sebagai notifikasi di
                ikon lonceng pada topbar dashboard.
              </Tip>
            </FeatureSection>

            {/* ──── 6. ABSENSI ──── */}
            <FeatureSection
              id="absensi"
              icon={ClipboardCheck}
              iconColor="text-teal-500"
              iconBg="bg-teal-500/10"
              title="Absensi"
              subtitle="Catat kehadiran atlet di setiap sesi latihan"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fitur absensi memungkinkan pencatatan kehadiran atlet untuk
                setiap sesi latihan yang terjadwal.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Cara Penggunaan:
              </h3>
              <div className="space-y-0">
                <StepCard
                  number={1}
                  title="Pilih Jadwal"
                  description="Pilih sesi latihan yang ingin diambil absensinya dari daftar jadwal."
                  icon={Calendar}
                />
                <StepCard
                  number={2}
                  title="Catat Kehadiran"
                  description="Untuk setiap atlet, tentukan statusnya: Hadir, Izin, atau Tidak Hadir."
                  icon={ClipboardCheck}
                />
                <StepCard
                  number={3}
                  title="Simpan Data"
                  description="Klik Simpan untuk menyimpan data absensi. Data ini akan terekam dan dapat dilihat di laporan."
                  icon={FileText}
                />
              </div>

              <div className="pt-2">
                <h3 className="font-semibold text-foreground text-sm mb-2">
                  Status Kehadiran:
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                    Hadir
                  </Badge>
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs">
                    Izin
                  </Badge>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                    Tidak Hadir
                  </Badge>
                </div>
              </div>
            </FeatureSection>

            {/* ──── 7. MONITORING PERFORMA ──── */}
            <FeatureSection
              id="monitoring-performa"
              icon={BarChart3}
              iconColor="text-orange-500"
              iconBg="bg-orange-500/10"
              title="Monitoring Performa"
              subtitle="Evaluasi dan pantau perkembangan atlet"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modul ini memungkinkan pelatih untuk mencatat evaluasi performa
                atlet secara berkala. Data performa divisualisasikan dalam
                grafik untuk memudahkan analisis perkembangan.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Fitur yang Tersedia:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Plus,
                    text: "Tambah record performa baru untuk setiap atlet",
                  },
                  {
                    icon: BarChart3,
                    text: "Lihat grafik tren performa dari waktu ke waktu",
                  },
                  {
                    icon: Edit3,
                    text: "Berikan catatan pelatih (coach notes) sebagai feedback",
                  },
                  {
                    icon: Eye,
                    text: "Bandingkan performa antar atlet atau antar periode",
                  },
                ]}
              />

              <Tip>
                Untuk role <strong>Atlet</strong>, fitur ini hanya menampilkan
                data performa milik sendiri. Atlet tidak dapat melihat data
                performa atlet lain.
              </Tip>
            </FeatureSection>

            {/* ──── 8. PRESTASI ──── */}
            <FeatureSection
              id="prestasi"
              icon={Trophy}
              iconColor="text-yellow-500"
              iconBg="bg-yellow-500/10"
              title="Prestasi"
              subtitle="Dokumentasikan pencapaian atlet"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fitur ini digunakan untuk mencatat dan mendokumentasikan
                prestasi yang diraih oleh atlet dalam berbagai turnamen dan
                kejuaraan.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Informasi Prestasi:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Trophy,
                    text: "Judul prestasi dan nama event/turnamen",
                  },
                  {
                    icon: Calendar,
                    text: "Tanggal pencapaian prestasi",
                  },
                  {
                    icon: BarChart3,
                    text: "Tingkat: Daerah, Nasional, atau Internasional",
                  },
                  {
                    icon: Shield,
                    text: "Hasil: Juara 1, Juara 2, Juara 3, Partisipasi, Lainnya",
                  },
                ]}
              />

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Kategori
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["Turnamen", "Kejuaraan", "Peringkat", "Lainnya"].map(
                      (c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Tingkat
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["Daerah", "Nasional", "Internasional"].map((l) => (
                      <Badge key={l} variant="secondary" className="text-xs">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </FeatureSection>

            {/* ──── 9. LAPORAN ──── */}
            <FeatureSection
              id="laporan"
              icon={FileText}
              iconColor="text-purple-500"
              iconBg="bg-purple-500/10"
              title="Laporan"
              subtitle="Generate dan export laporan komprehensif"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modul laporan menyediakan ringkasan data yang komprehensif dan
                dapat diexport dalam format PDF untuk keperluan evaluasi dan
                pelaporan.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Jenis Laporan:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Users,
                    text: "Laporan Data Atlet — daftar lengkap atlet dengan biodata",
                  },
                  {
                    icon: BarChart3,
                    text: "Laporan Performa — evaluasi dan tren performa atlet",
                  },
                  {
                    icon: ClipboardCheck,
                    text: "Laporan Kehadiran — rekap absensi per sesi latihan",
                  },
                  {
                    icon: Download,
                    text: 'Export PDF — klik tombol "Export PDF" untuk mengunduh',
                  },
                ]}
              />

              <Tip>
                Laporan dapat difilter berdasarkan rentang tanggal, atlet
                tertentu, atau program latihan untuk mendapatkan data yang lebih
                spesifik.
              </Tip>
            </FeatureSection>

            {/* ──── 10. PENGATURAN ──── */}
            <FeatureSection
              id="pengaturan"
              icon={Settings}
              iconColor="text-gray-500"
              iconBg="bg-gray-500/10"
              title="Pengaturan"
              subtitle="Konfigurasi sistem dan branding klub"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Menu pengaturan hanya tersedia untuk <strong>Admin</strong> dan{" "}
                <strong>Ketua Klub</strong>. Di sini Anda dapat mengkonfigurasi
                identitas klub dan mengelola pengguna.
              </p>

              <h3 className="font-semibold text-foreground text-sm pt-2">
                Yang Dapat Diatur:
              </h3>
              <CapabilityList
                items={[
                  {
                    icon: Edit3,
                    text: "Nama klub, logo, dan favicon",
                  },
                  {
                    icon: BookOpen,
                    text: "Sejarah, visi, dan misi klub",
                  },
                  {
                    icon: Users,
                    text: "Manajemen pengguna dan penetapan role",
                  },
                  {
                    icon: Eye,
                    text: "Sponsor dan mitra yang tampil di halaman publik",
                  },
                ]}
              />

              <Tip>
                Perubahan pada pengaturan branding (logo, nama klub) akan
                langsung terlihat di seluruh halaman publik dan dashboard.
              </Tip>
            </FeatureSection>

            {/* ──── 11. HAK AKSES ──── */}
            <section id="hak-akses" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center size-10 rounded-xl bg-red-500/10">
                  <Shield className="size-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Hak Akses
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tabel izin akses untuk setiap role
                  </p>
                </div>
              </div>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="py-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sistem ini menggunakan Role-Based Access Control (RBAC).
                    Setiap pengguna memiliki role yang menentukan fitur apa
                    saja yang dapat diakses.
                  </p>

                  {/* Role descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        role: "Admin",
                        desc: "Akses penuh ke seluruh fitur sistem",
                        color: "border-green-500/20 bg-green-500/5",
                      },
                      {
                        role: "Pelatih",
                        desc: "Mengelola latihan, atlet, dan evaluasi performa",
                        color: "border-blue-500/20 bg-blue-500/5",
                      },
                      {
                        role: "Ketua Klub",
                        desc: "Mengawasi data dan laporan, mengelola pengaturan",
                        color: "border-purple-500/20 bg-purple-500/5",
                      },
                      {
                        role: "Atlet",
                        desc: "Melihat performa dan prestasi pribadi",
                        color: "border-yellow-500/20 bg-yellow-500/5",
                      },
                    ].map((r) => (
                      <div
                        key={r.role}
                        className={cn(
                          "border rounded-xl px-4 py-3",
                          r.color
                        )}
                      >
                        <p className="font-semibold text-foreground text-sm">
                          {r.role}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Permission table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Modul
                          </th>
                          <th className="text-center py-3 px-3 font-semibold text-foreground">
                            Admin
                          </th>
                          <th className="text-center py-3 px-3 font-semibold text-foreground">
                            Pelatih
                          </th>
                          <th className="text-center py-3 px-3 font-semibold text-foreground">
                            Ketua Klub
                          </th>
                          <th className="text-center py-3 px-3 font-semibold text-foreground">
                            Atlet
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rolePermissions.map((row, i) => (
                          <tr
                            key={row.module}
                            className={cn(
                              "border-b border-border/50",
                              i % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                            )}
                          >
                            <td className="py-2.5 px-4 font-medium text-foreground">
                              {row.module}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <PermissionBadge level={row.admin} />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <PermissionBadge level={row.pelatih} />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <PermissionBadge level={row.ketua} />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <PermissionBadge level={row.atlet} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <PermissionBadge level="full" />
                      <span>= Akses penuh (baca, tulis, hapus)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PermissionBadge level="read" />
                      <span>= Hanya melihat data</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PermissionBadge level="own" />
                      <span>= Hanya data milik sendiri</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PermissionBadge level="none" />
                      <span>= Tidak dapat mengakses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ──── 12. FAQ ──── */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center size-10 rounded-xl bg-cyan-500/10">
                  <HelpCircle className="size-5 text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    FAQ
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Pertanyaan yang sering diajukan
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <FaqItem key={i} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </section>

            {/* ──── CTA ──── */}
            <section className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-card" />
              <div className="relative p-8 sm:p-12 text-center">
                <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 mx-auto mb-4">
                  <ArrowRight className="size-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Siap Memulai?
                </h2>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Masuk ke dashboard untuk mulai mengelola data pembinaan atlet
                  Anda sekarang juga.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[180px]"
                    >
                      <LogIn className="size-4" />
                      Masuk Dashboard
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="min-w-[180px]"
                    >
                      <UserPlus className="size-4" />
                      Daftar Akun
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Scroll to top - desktop */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hidden lg:flex fixed bottom-8 right-8 items-center justify-center size-12 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-foreground transition-colors z-50"
        >
          <ChevronUp className="size-5" />
        </button>
      )}
    </div>
  );
}

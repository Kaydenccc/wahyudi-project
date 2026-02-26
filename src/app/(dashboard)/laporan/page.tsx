"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  BarChart3,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const reportTypes = [
  {
    id: "monthly",
    label: "Rekap Latihan Bulanan",
    icon: Calendar,
    description: "Ringkasan seluruh kegiatan latihan dalam satu bulan",
  },
  {
    id: "athlete",
    label: "Rekap Performa Atlet",
    icon: Users,
    description: "Laporan detail perkembangan performa per atlet",
  },
  {
    id: "attendance",
    label: "Rekap Kehadiran",
    icon: BarChart3,
    description: "Analisis tingkat kehadiran atlet",
  },
];

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function generateMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string; year: number; month: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return options;
}

export default function LaporanPage() {
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [selectedType, setSelectedType] = useState("monthly");
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [reportPeriod, setReportPeriod] = useState<{ month: number; year: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState(monthOptions[0].value);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTrainingType, setSelectedTrainingType] = useState("all");

  const selectedMonthOption = monthOptions.find((o) => o.value === selectedMonthKey) || monthOptions[0];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const query = new URLSearchParams();
      query.set("type", selectedType);
      query.set("month", String(selectedMonthOption.month));
      query.set("year", String(selectedMonthOption.year));
      if (selectedCategory !== "all") query.set("category", selectedCategory);
      if (selectedTrainingType !== "all") query.set("trainingType", selectedTrainingType);

      const res = await fetch(`/api/reports?${query.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data laporan");
      const data = await res.json();
      setReportData(data.report || data.data || data.reports || []);
      setTotalSessions(data.totalSessions || 0);
      setReportPeriod(data.period || null);
      setShowPreview(true);
      toast.success("Laporan berhasil di-generate!");
    } catch {
      toast.error("Gagal mengambil data laporan");
    } finally {
      setGenerating(false);
    }
  };

  const avgAttendance = reportData.length > 0
    ? Math.round(reportData.reduce((sum, a) => sum + (a.attendance || 0), 0) / reportData.length)
    : 0;
  const avgScore = reportData.length > 0
    ? Math.round(reportData.reduce((sum, a) => sum + (a.avgScore || 0), 0) / reportData.length)
    : 0;
  const progresBaikCount = reportData.filter(
    (a) => a.assessment === "Progres Baik"
  ).length;
  const perluEvaluasiCount = reportData.filter(
    (a) => a.assessment === "Perlu Evaluasi"
  ).length;

  const periodLabel = reportPeriod
    ? `${monthNames[reportPeriod.month - 1]} ${reportPeriod.year}`
    : selectedMonthOption.label;

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("B-Club Badminton", 14, 20);
      doc.setFontSize(14);
      doc.text(`Rekap Latihan - ${periodLabel}`, 14, 30);

      // Summary
      doc.setFontSize(10);
      doc.text(`Total Sesi: ${totalSessions}`, 14, 42);
      doc.text(`Rata-rata Kehadiran: ${avgAttendance}%`, 14, 48);
      doc.text(`Rata-rata Skor: ${avgScore}/100`, 80, 42);
      doc.text(`Atlet Progres Baik: ${progresBaikCount}`, 80, 48);

      // Table
      autoTable(doc, {
        startY: 56,
        head: [["Atlet", "Sesi Diikuti", "Kehadiran", "Skor Rata-rata", "Penilaian"]],
        body: reportData.map((a) => [
          a.name,
          `${a.sessions}/${totalSessions}`,
          `${a.attendance}%`,
          `${a.avgScore}/100`,
          a.assessment,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94] },
      });

      doc.save(`laporan-${periodLabel.replace(/\s/g, "-").toLowerCase()}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch {
      toast.error("Gagal mengexport PDF");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Buat dan ekspor laporan latihan dan performa atlet."
      >
        {showPreview && (
          <Button
            onClick={handleExportPDF}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Ekspor PDF
          </Button>
        )}
      </PageHeader>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "border-border bg-card cursor-pointer transition-all hover:border-primary/30",
              selectedType === type.id && "border-primary ring-1 ring-primary/30"
            )}
            onClick={() => {
              setSelectedType(type.id);
              setShowPreview(false);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <type.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{type.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select value={selectedMonthKey} onValueChange={setSelectedMonthKey}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {monthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Pra Usia Dini">Pra Usia Dini</SelectItem>
                  <SelectItem value="Usia Dini">Usia Dini</SelectItem>
                  <SelectItem value="Anak-anak">Anak-anak</SelectItem>
                  <SelectItem value="Pemula">Pemula</SelectItem>
                  <SelectItem value="Remaja">Remaja</SelectItem>
                  <SelectItem value="Taruna">Taruna</SelectItem>
                  <SelectItem value="Dewasa">Dewasa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jenis Latihan</Label>
              <Select value={selectedTrainingType} onValueChange={setSelectedTrainingType}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="Teknik">Teknik</SelectItem>
                  <SelectItem value="Fisik">Fisik</SelectItem>
                  <SelectItem value="Taktik">Taktik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generating ? "Membuat..." : "Buat Laporan"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {showPreview && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Sesi Latihan"
              value={totalSessions}
              icon={Calendar}
            />
            <StatCard
              title="Rata-rata Kehadiran"
              value={`${avgAttendance}%`}
              icon={BarChart3}
              iconColor="text-green-400"
            />
            <StatCard
              title="Rata-rata Skor"
              value={`${avgScore}/100`}
              icon={TrendingUp}
              iconColor="text-blue-400"
            />
            <StatCard
              title="Atlet Progres Baik"
              value={progresBaikCount}
              icon={Users}
              iconColor="text-primary"
            />
          </div>

          {/* Detailed Report Table */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Rekap Latihan - {periodLabel}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Penilaian otomatis: Kehadiran &lt; 60% atau skor &lt; 60 = Perlu Evaluasi | Skor naik &gt; 10% &amp; kehadiran &ge; 60% = Progres Baik
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Atlet
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Sesi Diikuti
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Kehadiran
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Skor Rata-rata
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Penilaian
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((athlete, i) => (
                      <tr
                        key={athlete._id || i}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {athlete.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">
                              {athlete.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground">
                          {athlete.sessions}/{totalSessions}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={athlete.attendance}
                              className={cn(
                                "w-16 h-2 bg-secondary",
                                athlete.attendance >= 80
                                  ? "[&>div]:bg-green-500"
                                  : athlete.attendance >= 60
                                    ? "[&>div]:bg-yellow-500"
                                    : "[&>div]:bg-red-500"
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                athlete.attendance >= 80
                                  ? "text-green-400"
                                  : athlete.attendance >= 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              )}
                            >
                              {athlete.attendance}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={athlete.avgScore}
                              className="w-16 h-2 bg-secondary [&>div]:bg-primary"
                            />
                            <span className="text-sm font-bold text-primary">
                              {athlete.avgScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={athlete.assessment} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Auto Assessment Summary */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">
                Kesimpulan Penilaian Otomatis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-400">
                    {progresBaikCount} atlet menunjukkan Progres Baik
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Peningkatan skor &gt; 10% dalam periode ini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <Users className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    {perluEvaluasiCount} atlet Perlu Evaluasi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kehadiran di bawah 60% atau skor rata-rata di bawah 60
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

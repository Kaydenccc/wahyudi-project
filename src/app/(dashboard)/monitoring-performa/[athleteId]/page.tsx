"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, TrendingUp, Info, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { SkillRadarChart } from "@/components/performance/radar-chart";
import { PerformanceBarChart } from "@/components/performance/performance-bar-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAthletePerformance } from "@/hooks/use-performance";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AthletePerformancePage() {
  const params = useParams();
  const athleteId = params.athleteId as string;
  const { data, isLoading, mutate } = useAthletePerformance(athleteId);
  const { user: sessionUser } = useSession();

  const [chartMode, setChartMode] = useState<"smash" | "skor">("skor");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<string>("TRAINING");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Compute skill radar data from latest stats
  const skillRadarData = useMemo(() => {
    const s = data?.stats || {};
    return [
      { skill: "Smash", value: Math.min(10, (s.smashSpeed?.value || 0) / 35), fullMark: 10 },
      { skill: "Footwork", value: s.footworkRating?.value || 0, fullMark: 10 },
      { skill: "Stamina", value: Math.min(10, (data?.recovery?.overall || 0) / 10), fullMark: 10 },
      { skill: "Akurasi", value: Math.min(10, (s.netAccuracy?.value || 0) / 10), fullMark: 10 },
      { skill: "Pertahanan", value: Math.min(10, (s.winProbability?.value || 0) / 10), fullMark: 10 },
      { skill: "Servis", value: Math.min(10, ((s.smashSpeed?.value || 0) / 35 + (s.netAccuracy?.value || 0) / 10) / 2), fullMark: 10 },
    ];
  }, [data]);

  // Compute bar chart data from performances array
  const barChartData = useMemo(() => {
    const performances = data?.performances || [];
    if (performances.length === 0) return [];

    const sorted = [...performances].sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Take last 8 records
    const recent = sorted.slice(-8);
    return recent.map((p: any, i: number) => ({
      week: i === recent.length - 1 ? "Terkini" : format(new Date(p.date), "dd MMM"),
      smash: p.stats?.smashSpeed || 0,
      skor: p.score || 0,
    }));
  }, [data]);

  const handleSubmitNote = async () => {
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await fetch("/api/coach-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athlete: athleteId,
          date: new Date().toISOString(),
          type: noteType,
          content: noteContent,
          coach: sessionUser?.name || "Coach",
        }),
      });
      if (!res.ok) throw new Error("Gagal menambahkan catatan");
      toast.success("Catatan berhasil ditambahkan!");
      setNoteContent("");
      setShowNoteForm(false);
      mutate();
    } catch {
      toast.error("Gagal menambahkan catatan");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link
          href="/monitoring-performa"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Monitoring Performa
        </Link>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat...</div>
        </div>
      </div>
    );
  }

  const athlete = data?.athlete;
  const performances = data?.performances || [];
  const coachNotes = data?.coachNotes || [];
  const injuries = data?.athlete?.injuries || [];
  const stats = data?.stats || {
    smashSpeed: { value: 0, unit: "km/h", change: "0%" },
    footworkRating: { value: 0, unit: "/10", change: "0%" },
    winProbability: { value: 0, unit: "%", change: "0%" },
    netAccuracy: { value: 0, unit: "%", change: "0%" },
  };
  const recovery = data?.recovery || {
    overall: 0,
    sleepScore: 0,
    hrvStatus: "N/A",
  };

  const lastUpdated = performances.length > 0 && performances[0].date
    ? format(new Date(performances[0].date), "dd MMM yyyy")
    : "N/A";

  const initials = athlete?.name
    ? athlete.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="space-y-6">
      <Link
        href="/monitoring-performa"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Monitoring Performa
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Profile Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-3 border-4 border-primary/30">
                {athlete?.photo && (
                  <AvatarImage src={athlete.photo} alt={athlete.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold text-foreground">
                {athlete?.name || "Unknown"}
              </h2>
              <p className="text-xs font-semibold text-primary tracking-wider">
                {athlete?.category || "N/A"} &bull; {athlete?.position || "N/A"}
              </p>
            </CardContent>
          </Card>

          {/* Recovery Status */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Status Pemulihan
                </CardTitle>
                <Info className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">
                    Kesiapan Keseluruhan
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {recovery.overall}%
                  </span>
                </div>
                <Progress
                  value={recovery.overall}
                  className="h-2 bg-secondary [&>div]:bg-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Skor Tidur
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {recovery.sleepScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Status HRV
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {recovery.hrvStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Rata-rata Kec. Smash", stat: stats.smashSpeed },
              { label: "Rating Footwork", stat: stats.footworkRating },
              { label: "Probabilitas Menang", stat: stats.winProbability },
              { label: "Akurasi Net", stat: stats.netAccuracy },
            ].map((item) => (
              <Card key={item.label} className="border-border bg-card">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-foreground">
                      {item.stat?.value || 0}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.stat?.unit || ""}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xs",
                    (item.stat?.change || "").startsWith("-") ? "text-red-400" : "text-green-400"
                  )}>
                    {item.stat?.change || "0%"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Radar Keterampilan Teknis
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Terakhir diperbarui: {lastUpdated}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SkillRadarChart data={skillRadarData} />
              </CardContent>
            </Card>

            {/* Performance Trend */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tren Performa</CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChartMode("skor")}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                        chartMode === "skor"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      SKOR
                    </button>
                    <button
                      onClick={() => setChartMode("smash")}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                        chartMode === "smash"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      SMASH
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PerformanceBarChart mode={chartMode} data={barChartData} />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Coach Notes & Injuries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coach Evaluation Notes */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Catatan Evaluasi Pelatih
                  </CardTitle>
                  {(sessionUser?.role === "Admin" || sessionUser?.role === "Pelatih") && (
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto text-sm"
                      onClick={() => setShowNoteForm(!showNoteForm)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Catatan Baru
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showNoteForm && (
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
                    <Select value={noteType} onValueChange={setNoteType}>
                      <SelectTrigger className="bg-secondary border-border h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="TRAINING">Latihan</SelectItem>
                        <SelectItem value="POST-MATCH">Pasca-Pertandingan</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Tulis catatan..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="bg-secondary border-border text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitNote();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        className="h-9 w-9 shrink-0 bg-primary text-primary-foreground"
                        onClick={handleSubmitNote}
                        disabled={submittingNote || !noteContent.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {coachNotes.map((note: any, i: number) => (
                  <div key={note._id || i} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    {i < coachNotes.length - 1 && (
                      <div className="absolute left-[4.5px] top-4 bottom-0 w-px bg-border" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">
                          {note.date ? format(new Date(note.date), "dd MMM yyyy") : ""}
                        </span>
                        <StatusBadge status={note.type === "POST-MATCH" ? "Pasca-Pertandingan" : "Latihan"} />
                      </div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        {note.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        — {note.coach}
                      </p>
                    </div>
                  </div>
                ))}
                {coachNotes.length === 0 && !showNoteForm && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada catatan pelatih.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Injury & Health Tracking */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Pelacakan Cedera & Kesehatan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {injuries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada riwayat cedera.
                  </p>
                )}
                {injuries.map((injury: any, i: number) => {
                  const isRecovered = injury.status === "Sembuh";
                  const severityLabel = injury.severity === "Berat"
                    ? "Cedera Berat" : injury.severity === "Sedang"
                    ? "Cedera Sedang" : "Cedera Ringan";

                  // Calculate recovery progress dynamically
                  let recoveryProgress = isRecovered ? 100 : 60;
                  let recoveryText = isRecovered ? "Pulih sepenuhnya" : "Dalam proses pemulihan";
                  if (!isRecovered && injury.date && injury.recoveryWeeks) {
                    const injuryDate = new Date(injury.date).getTime();
                    const totalMs = injury.recoveryWeeks * 7 * 24 * 60 * 60 * 1000;
                    const elapsed = Date.now() - injuryDate;
                    recoveryProgress = Math.min(95, Math.max(5, Math.round((elapsed / totalMs) * 100)));
                    const weeksLeft = Math.max(0, Math.ceil((totalMs - elapsed) / (7 * 24 * 60 * 60 * 1000)));
                    recoveryText = weeksLeft > 0 ? `Est. ${weeksLeft} minggu lagi` : "Masa pemulihan selesai";
                  }

                  return (
                    <div
                      key={injury._id || i}
                      className="p-4 rounded-xl bg-secondary/50 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center text-lg",
                              isRecovered ? "bg-green-500/10" : "bg-orange-500/10"
                            )}
                          >
                            {isRecovered ? "✅" : "🩹"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {injury.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {injury.date ? format(new Date(injury.date), "dd MMM yyyy") : "—"}
                              {injury.recoveryWeeks ? ` · Est. ${injury.recoveryWeeks} minggu` : ""}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={injury.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{severityLabel}</span>
                        <span
                          className={cn(
                            "font-medium",
                            isRecovered ? "text-green-400" : "text-orange-400"
                          )}
                        >
                          {recoveryText}
                        </span>
                      </div>
                      <Progress
                        value={recoveryProgress}
                        className={cn(
                          "h-1.5",
                          isRecovered
                            ? "bg-secondary [&>div]:bg-green-500"
                            : "bg-secondary [&>div]:bg-orange-500"
                        )}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

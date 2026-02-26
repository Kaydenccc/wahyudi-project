"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit, Phone, Calendar, Ruler, Weight, Activity, TrendingUp, Heart, Plus, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAthlete } from "@/hooks/use-athletes";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export default function AtletDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { athlete, isLoading, mutate } = useAthlete(id);
  const { user } = useSession();
  const canEdit = user?.role === "Admin" || user?.role === "Pelatih";

  const [showInjuryForm, setShowInjuryForm] = useState(false);
  const [injuryForm, setInjuryForm] = useState({
    type: "",
    date: new Date().toISOString().split("T")[0],
    severity: "Ringan",
    recoveryWeeks: "4",
  });
  const [submittingInjury, setSubmittingInjury] = useState(false);

  const handleAddInjury = async () => {
    if (!injuryForm.type.trim()) {
      toast.error("Jenis cedera wajib diisi");
      return;
    }
    setSubmittingInjury(true);
    try {
      const res = await fetch(`/api/athletes/${id}/injuries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: injuryForm.type,
          date: injuryForm.date,
          severity: injuryForm.severity,
          recoveryWeeks: Number(injuryForm.recoveryWeeks) || 4,
        }),
      });
      if (!res.ok) throw new Error("Gagal menambahkan cedera");
      toast.success("Data cedera berhasil ditambahkan");
      setInjuryForm({ type: "", date: new Date().toISOString().split("T")[0], severity: "Ringan", recoveryWeeks: "4" });
      setShowInjuryForm(false);
      mutate();
    } catch {
      toast.error("Gagal menambahkan cedera");
    } finally {
      setSubmittingInjury(false);
    }
  };

  const handleRecoverInjury = async (injuryId: string) => {
    try {
      const res = await fetch(`/api/athletes/${id}/injuries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ injuryId, status: "Sembuh" }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status");
      toast.success("Status cedera diperbarui menjadi Sembuh");
      mutate();
    } catch {
      toast.error("Gagal memperbarui status cedera");
    }
  };

  const handleDeleteInjury = async (injuryId: string) => {
    try {
      const res = await fetch(`/api/athletes/${id}/injuries?injuryId=${injuryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus cedera");
      toast.success("Data cedera berhasil dihapus");
      mutate();
    } catch {
      toast.error("Gagal menghapus cedera");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link href="/data-atlet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Data Atlet
        </Link>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Memuat data atlet...</p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="space-y-6">
        <Link href="/data-atlet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Data Atlet
        </Link>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Atlet tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  const initials = athlete.name
    ? athlete.name.split(" ").map((n: string) => n[0]).join("")
    : "";

  const activeInjuries = athlete.injuries
    ? athlete.injuries.filter((inj: { status: string }) => inj.status !== "Sembuh").length
    : 0;

  return (
    <div className="space-y-6">
      <Link href="/data-atlet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Data Atlet
      </Link>

      {/* Profile Header */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/30">
              {athlete.photo && (
                <AvatarImage src={athlete.photo} alt={athlete.name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{athlete.name}</h2>
                <StatusBadge status={athlete.status} />
              </div>
              <p className="text-sm text-primary font-medium mb-3">{athlete.category} &bull; {athlete.position}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> {athlete.age ?? 0} tahun
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4" /> {athlete.height} cm
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Weight className="h-4 w-4" /> {athlete.weight} kg
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {athlete.phone}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Link href={`/data-atlet/${athlete._id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </Link>
              )}
              <Link href={`/monitoring-performa/${athlete._id}`}>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" /> Lihat Performa
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-foreground">{athlete.attendance ?? 0}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rata-rata Performa</p>
              <p className="text-2xl font-bold text-foreground">{athlete.avgScore ?? 0}/100</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cedera Aktif</p>
              <p className="text-2xl font-bold text-foreground">{activeInjuries}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Performance */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Performa Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(athlete.recentPerformance || []).map((p: { date: string; score: number; type: string }, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{new Date(p.date).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p className="text-xs text-muted-foreground">{p.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={p.score} className="w-24 h-2 bg-secondary [&>div]:bg-primary" />
                  <span className="text-sm font-bold text-primary">{p.score}</span>
                </div>
              </div>
            ))}
            <Link href={`/monitoring-performa/${athlete._id}`}>
              <Button variant="link" className="text-primary p-0 h-auto">
                Lihat Performa Lengkap →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Injury History */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Riwayat Cedera</CardTitle>
              {canEdit && (
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto text-sm"
                  onClick={() => setShowInjuryForm(!showInjuryForm)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah Cedera
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Injury Form */}
            {showInjuryForm && (
              <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Jenis Cedera *</Label>
                    <Input
                      placeholder="Contoh: Cedera Lutut"
                      className="bg-secondary border-border text-sm"
                      value={injuryForm.type}
                      onChange={(e) => setInjuryForm((prev) => ({ ...prev, type: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tanggal Cedera *</Label>
                    <Input
                      type="date"
                      className="bg-secondary border-border text-sm"
                      value={injuryForm.date}
                      onChange={(e) => setInjuryForm((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tingkat Keparahan</Label>
                    <Select
                      value={injuryForm.severity}
                      onValueChange={(v) => setInjuryForm((prev) => ({ ...prev, severity: v }))}
                    >
                      <SelectTrigger className="bg-secondary border-border text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Ringan">Ringan</SelectItem>
                        <SelectItem value="Sedang">Sedang</SelectItem>
                        <SelectItem value="Berat">Berat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Estimasi Pemulihan (Minggu)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      className="bg-secondary border-border text-sm"
                      value={injuryForm.recoveryWeeks}
                      onChange={(e) => setInjuryForm((prev) => ({ ...prev, recoveryWeeks: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInjuryForm(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={handleAddInjury}
                    disabled={submittingInjury}
                  >
                    {submittingInjury ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </div>
            )}

            {/* Injury List */}
            {(athlete.injuries || []).map((injury: { _id: string; type: string; date: string; status: string; severity?: string; recoveryWeeks?: number }, i: number) => (
              <div key={injury._id || i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{injury.type}</p>
                    {injury.severity && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {injury.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(injury.date).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}
                    {injury.recoveryWeeks ? ` · Est. ${injury.recoveryWeeks} minggu` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={injury.status} />
                  {canEdit && injury.status !== "Sembuh" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-400 hover:text-green-300"
                      onClick={() => handleRecoverInjury(injury._id)}
                      title="Tandai Sembuh"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteInjury(injury._id)}
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!athlete.injuries || athlete.injuries.length === 0) && !showInjuryForm && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada riwayat cedera.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

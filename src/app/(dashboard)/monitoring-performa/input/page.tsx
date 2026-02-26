"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Zap, Target, Trophy, Crosshair, Heart, Moon, Activity } from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

interface AthleteOption {
  _id: string;
  name: string;
  category: string;
}

export default function InputPerformaPage() {
  const router = useRouter();
  const { user } = useSession();
  const [athletes, setAthletes] = useState<AthleteOption[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    athlete: "",
    date: new Date().toISOString().split("T")[0],
    type: "Training" as "Training" | "Post-Match",
    score: 75,
    smashSpeed: 0,
    footworkRating: 5,
    winProbability: 50,
    netAccuracy: 50,
    recoveryOverall: 80,
    sleepScore: 75,
    hrvStatus: "Normal",
  });

  useEffect(() => {
    async function fetchAthletes() {
      try {
        const res = await fetch("/api/athletes?limit=100");
        if (res.ok) {
          const data = await res.json();
          setAthletes(
            (data.athletes || []).map((a: any) => ({
              _id: a._id,
              name: a.name,
              category: a.category,
            }))
          );
        }
      } catch {
        // ignore
      } finally {
        setLoadingAthletes(false);
      }
    }
    fetchAthletes();
  }, []);

  if (user && user.role !== "Admin" && user.role !== "Pelatih") {
    return (
      <div className="space-y-6">
        <PageHeader title="Akses Ditolak" description="Hanya Admin dan Pelatih yang dapat mengakses halaman ini." />
      </div>
    );
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.athlete) {
      toast.error("Pilih atlet terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        athlete: formData.athlete,
        date: formData.date,
        type: formData.type,
        score: Number(formData.score),
        stats: {
          smashSpeed: Number(formData.smashSpeed) || undefined,
          footworkRating: Number(formData.footworkRating) || undefined,
          winProbability: Number(formData.winProbability) || undefined,
          netAccuracy: Number(formData.netAccuracy) || undefined,
        },
        recovery: {
          overall: Number(formData.recoveryOverall) || undefined,
          sleepScore: Number(formData.sleepScore) || undefined,
          hrvStatus: formData.hrvStatus || undefined,
        },
      };

      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan data performa");
      }

      toast.success("Data performa berhasil disimpan!");
      router.push("/monitoring-performa");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan data performa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/monitoring-performa"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Monitoring Performa
      </Link>

      <PageHeader
        title="Input Data Performa"
        description="Catat hasil latihan dan performa atlet."
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="athlete">Atlet *</Label>
                <Select
                  value={formData.athlete}
                  onValueChange={(v) => handleChange("athlete", v)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder={loadingAthletes ? "Memuat..." : "Pilih atlet"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {athletes.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name} ({a.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal *</Label>
                <Input
                  id="date"
                  type="date"
                  className="bg-secondary border-border"
                  required
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Jenis Sesi</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => handleChange("type", v)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Training">Latihan</SelectItem>
                    <SelectItem value="Post-Match">Pasca-Pertandingan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Skor Teknik (0-100) *</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="score"
                    type="range"
                    min={0}
                    max={100}
                    className="flex-1"
                    value={formData.score}
                    onChange={(e) => handleChange("score", Number(e.target.value))}
                  />
                  <span className="text-lg font-bold text-primary w-12 text-right">
                    {formData.score}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Statistik Performa
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smashSpeed" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  Kecepatan Smash (km/h)
                </Label>
                <Input
                  id="smashSpeed"
                  type="number"
                  min={0}
                  max={500}
                  placeholder="Contoh: 280"
                  className="bg-secondary border-border"
                  value={formData.smashSpeed || ""}
                  onChange={(e) => handleChange("smashSpeed", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footworkRating" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  Rating Footwork (1-10)
                </Label>
                <Input
                  id="footworkRating"
                  type="number"
                  min={1}
                  max={10}
                  step={0.1}
                  placeholder="Contoh: 7.5"
                  className="bg-secondary border-border"
                  value={formData.footworkRating || ""}
                  onChange={(e) => handleChange("footworkRating", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="winProbability" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  Probabilitas Menang (%)
                </Label>
                <Input
                  id="winProbability"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Contoh: 65"
                  className="bg-secondary border-border"
                  value={formData.winProbability || ""}
                  onChange={(e) => handleChange("winProbability", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="netAccuracy" className="flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-purple-400" />
                  Akurasi Pukulan (%)
                </Label>
                <Input
                  id="netAccuracy"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Contoh: 72"
                  className="bg-secondary border-border"
                  value={formData.netAccuracy || ""}
                  onChange={(e) => handleChange("netAccuracy", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recovery / Daya Tahan */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                Daya Tahan & Pemulihan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recoveryOverall" className="flex items-center gap-2">
                  Kesiapan Keseluruhan (%)
                </Label>
                <Input
                  id="recoveryOverall"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Contoh: 85"
                  className="bg-secondary border-border"
                  value={formData.recoveryOverall || ""}
                  onChange={(e) => handleChange("recoveryOverall", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleepScore" className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  Skor Tidur (0-100)
                </Label>
                <Input
                  id="sleepScore"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Contoh: 80"
                  className="bg-secondary border-border"
                  value={formData.sleepScore || ""}
                  onChange={(e) => handleChange("sleepScore", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hrvStatus">Status HRV</Label>
                <Select
                  value={formData.hrvStatus}
                  onValueChange={(v) => handleChange("hrvStatus", v)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Baik">Baik</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Rendah">Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3 justify-end">
            <Link href="/monitoring-performa">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Simpan Performa"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

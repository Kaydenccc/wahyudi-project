"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { usePrograms } from "@/hooks/use-programs";
import { useAthletes } from "@/hooks/use-athletes";
import { useUsers } from "@/hooks/use-users";

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function TambahJadwalPage() {
  const router = useRouter();
  const { programs, isLoading: programsLoading } = usePrograms({});
  const { athletes, isLoading: athletesLoading } = useAthletes({ limit: 50 });
  const { users } = useUsers();
  const coaches = (users || []).filter((u: any) => u.role === "Pelatih");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programId, setProgramId] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [coach, setCoach] = useState("");
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleAthlete = (id: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programId) {
      toast.error("Pilih program latihan");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateObj = new Date(date);
      const day = dayNames[dateObj.getDay()];

      const body = {
        program: programId,
        date,
        day,
        startTime,
        endTime,
        venue,
        coach,
        athletes: selectedAthletes,
        status: "Terjadwal",
        notes,
      };

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal membuat jadwal");
      }

      toast.success("Jadwal latihan berhasil dibuat!");
      router.push("/program-latihan/jadwal");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/program-latihan/jadwal"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Jadwal Latihan
      </Link>

      <PageHeader
        title="Buat Jadwal Latihan Baru"
        description="Tentukan waktu pelaksanaan dari program latihan yang sudah dibuat."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Detail Jadwal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Program Latihan</Label>
              <Select value={programId} onValueChange={setProgramId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={programsLoading ? "Memuat..." : "Pilih program latihan"} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {(programs || []).map((p: any) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  className="bg-secondary border-border"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tempat / Lapangan</Label>
                <Input
                  placeholder="cth. Lapangan A, GOR"
                  className="bg-secondary border-border"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jam Mulai</Label>
                <Input
                  type="time"
                  className="bg-secondary border-border"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Jam Selesai</Label>
                <Input
                  type="time"
                  className="bg-secondary border-border"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pelatih</Label>
              <Select value={coach} onValueChange={setCoach}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Pilih pelatih" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {coaches.map((c: any) => (
                    <SelectItem key={c._id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Atlet yang Mengikuti</CardTitle>
          </CardHeader>
          <CardContent>
            {athletesLoading ? (
              <div className="text-muted-foreground text-sm py-4 text-center">Memuat...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(athletes || []).map((a: any) => (
                  <label
                    key={a._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-green-500"
                      checked={selectedAthletes.includes(a._id)}
                      onChange={() => toggleAthlete(a._id)}
                    />
                    <span className="text-sm text-foreground">{a.name}</span>
                    <span className="text-xs text-muted-foreground">({a.category})</span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Catatan Tambahan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Catatan untuk jadwal ini..."
              className="bg-secondary border-border"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Link href="/program-latihan/jadwal">
            <Button variant="outline" type="button">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </form>
    </div>
  );
}

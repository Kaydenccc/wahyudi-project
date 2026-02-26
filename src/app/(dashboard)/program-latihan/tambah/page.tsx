"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
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

export default function TambahProgramPage() {
  const router = useRouter();
  const [drills, setDrills] = useState([{ name: "" }]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [target, setTarget] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDrill = () => setDrills([...drills, { name: "" }]);
  const removeDrill = (index: number) =>
    setDrills(drills.filter((_, i) => i !== index));
  const updateDrill = (index: number, value: string) => {
    const updated = [...drills];
    updated[index] = { name: value };
    setDrills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          description,
          duration: Number(duration),
          target,
          objective,
          drills: drills
            .filter((d) => d.name.trim() !== "")
            .map((d) => ({ name: d.name, description: "" })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create program");
      }
      toast.success("Program latihan berhasil dibuat!");
      router.push("/program-latihan");
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/program-latihan"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Program Latihan
      </Link>

      <PageHeader
        title="Buat Program Latihan Baru"
        description="Rancang program latihan untuk atlet Anda."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Detail Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nama Program</Label>
              <Input
                id="title"
                placeholder="cth. Latihan Net Play Ofensif"
                className="bg-secondary border-border"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tentang program ini..."
                className="bg-secondary border-border"
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Teknik">Teknik</SelectItem>
                    <SelectItem value="Fisik">Fisik</SelectItem>
                    <SelectItem value="Taktik">Taktik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Menit)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  className="bg-secondary border-border"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                placeholder="cth. 100 Repetisi, 20 Set"
                className="bg-secondary border-border"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Tujuan</Label>
              <Textarea
                id="objective"
                placeholder="Jelaskan tujuan utama program..."
                className="bg-secondary border-border"
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Drills */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Latihan Spesifik</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDrill}
            >
              <Plus className="h-4 w-4 mr-1" /> Tambah Latihan
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {drills.map((drill, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
              >
                <Input
                  placeholder={`Latihan ${index + 1}: cth. Pukulan cross-court`}
                  value={drill.name}
                  onChange={(e) => updateDrill(index, e.target.value)}
                  className="bg-secondary border-border flex-1"
                />
                {drills.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDrill(index)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Link href="/program-latihan">
            <Button variant="outline" type="button">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan Program"}
          </Button>
        </div>
      </form>
    </div>
  );
}

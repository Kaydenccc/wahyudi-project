"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Clock,
  Target,
  Users,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useProgram } from "@/hooks/use-programs";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export default function ProgramDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { program, isLoading, mutate } = useProgram(id || null);
  const { user: sessionUser } = useSession();
  const canEdit = sessionUser?.role === "Admin" || sessionUser?.role === "Pelatih";

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formObjective, setFormObjective] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formDuration, setFormDuration] = useState("");

  const openEditDialog = () => {
    if (!program) return;
    setFormName(program.name || "");
    setFormType(program.type || "Teknik");
    setFormDescription(program.description || "");
    setFormObjective(program.objective || "");
    setFormTarget(program.target || "");
    setFormDuration(String(program.duration || ""));
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          type: formType,
          description: formDescription,
          objective: formObjective,
          target: formTarget,
          duration: Number(formDuration),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Program berhasil diupdate!");
      setShowEditDialog(false);
      mutate();
    } catch {
      toast.error("Gagal mengupdate program");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link
          href="/program-latihan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Program Latihan
        </Link>
        <div className="text-center py-12 text-muted-foreground">Memuat detail program...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-6">
        <Link
          href="/program-latihan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Program Latihan
        </Link>
        <div className="text-center py-12 text-muted-foreground">Program tidak ditemukan.</div>
      </div>
    );
  }

  const athletes = program.assignedAthletes || [];
  const drills = program.drills || [];

  return (
    <div className="space-y-6">
      <Link
        href="/program-latihan"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Program Latihan
      </Link>

      <PageHeader title={program.name} description={program.description}>
        {canEdit && (
          <Button variant="outline" onClick={openEditDialog}>
            <Edit className="h-4 w-4 mr-2" /> Edit Program
          </Button>
        )}
      </PageHeader>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <StatusBadge status={program.type} className="mb-2" />
            <p className="text-xs text-muted-foreground">Tipe</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Clock className="h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">
              {program.duration} Menit
            </p>
            <p className="text-xs text-muted-foreground">Durasi</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Target className="h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">
              {program.target}
            </p>
            <p className="text-xs text-muted-foreground">Target</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Users className="h-5 w-5 text-primary" />
            <p className="text-lg font-bold text-foreground">
              {athletes.length}
            </p>
            <p className="text-xs text-muted-foreground">Atlet</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Objective & Drills */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Tujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {program.objective}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Drill Spesifik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drills.map((drill: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {drill.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {drill.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Athletes */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Atlet yang Ditugaskan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {athletes.map((athlete: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(athlete.name || "")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {athlete.name}
                    </span>
                  </div>
                  <StatusBadge status={athlete.status || athlete.category || "Aktif"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Program Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Nama Program</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tipe</label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="mt-1 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Teknik">Teknik</SelectItem>
                  <SelectItem value="Fisik">Fisik</SelectItem>
                  <SelectItem value="Taktik">Taktik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Deskripsi</label>
              <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tujuan</label>
              <Input value={formObjective} onChange={(e) => setFormObjective(e.target.value)} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Target</label>
              <Input value={formTarget} onChange={(e) => setFormTarget(e.target.value)} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Durasi (menit)</label>
              <Input type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="mt-1 bg-secondary border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !formName}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

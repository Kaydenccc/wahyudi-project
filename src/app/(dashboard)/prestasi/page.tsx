"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Plus,
  Search,
  Medal,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAchievements } from "@/hooks/use-achievements";
import { useAthletes } from "@/hooks/use-athletes";
import { useSession } from "@/hooks/use-session";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  achievementCategories as CATEGORIES,
  achievementLevels as LEVELS,
  achievementResults as RESULTS,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getResultStyle(result: string) {
  switch (result) {
    case "Juara 1":
      return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    case "Juara 2":
      return { text: "text-gray-300", bg: "bg-gray-500/10", border: "border-gray-500/20" };
    case "Juara 3":
      return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
    case "Partisipasi":
      return { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    default:
      return { text: "text-muted-foreground", bg: "bg-muted/10", border: "border-border" };
  }
}

function getTrophyIconStyle(result: string) {
  switch (result) {
    case "Juara 1":
      return "bg-yellow-500/10 text-yellow-400";
    case "Juara 2":
      return "bg-gray-500/10 text-gray-300";
    case "Juara 3":
      return "bg-orange-500/10 text-orange-400";
    case "Partisipasi":
      return "bg-blue-500/10 text-blue-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getCategoryStyle(category: string) {
  switch (category) {
    case "Turnamen":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Kejuaraan":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Peringkat":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

function getLevelStyle(level: string) {
  switch (level) {
    case "Daerah":
      return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    case "Nasional":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "Internasional":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function truncate(text: string, length: number) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AchievementForm {
  athlete: string;
  title: string;
  description: string;
  date: string;
  category: string;
  level: string;
  result: string;
}

const emptyForm: AchievementForm = {
  athlete: "",
  title: "",
  description: "",
  date: "",
  category: "",
  level: "",
  result: "",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function PrestasiPage() {
  const { user } = useSession();

  // Permission helpers
  const isAdmin = user?.role === "Admin";
  const isPelatih = user?.role === "Pelatih";
  const isAtlet = user?.role === "Atlet";
  const isKetuaKlub = user?.role === "Ketua Klub";
  const canCreate = isAdmin || isPelatih || isAtlet;
  const canEditDelete = isAdmin || isPelatih || isAtlet;

  // ---------------------------------------------------------------------------
  // Filter state
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { achievements, pagination, isLoading, mutate } = useAchievements({
    category: filterCategory,
    level: filterLevel,
    page: currentPage,
    limit: 9,
  });

  const { athletes: allAthletes } = useAthletes({ limit: 100 });

  // Athlete profile for Atlet role
  const [ownAthleteId, setOwnAthleteId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isAtlet) return;
    let cancelled = false;
    setProfileLoading(true);
    fetch("/api/auth/profile")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch profile");
      })
      .then((data) => {
        if (!cancelled && data?.athleteId) {
          setOwnAthleteId(
            typeof data.athleteId === "object" ? data.athleteId._id || data.athleteId : data.athleteId
          );
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setProfileLoading(false); });
    return () => { cancelled = true; };
  }, [isAtlet]);

  // ---------------------------------------------------------------------------
  // Client-side search filter (API doesn't support text search)
  // ---------------------------------------------------------------------------
  const filteredAchievements = debouncedSearch
    ? achievements.filter((a: any) => {
        const query = debouncedSearch.toLowerCase();
        const title = (a.title || "").toLowerCase();
        const athleteName = (a.athlete?.name || "").toLowerCase();
        return title.includes(query) || athleteName.includes(query);
      })
    : achievements;

  // ---------------------------------------------------------------------------
  // Dialog state
  // ---------------------------------------------------------------------------
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AchievementForm>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const openCreateDialog = useCallback(() => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      athlete: isAtlet && ownAthleteId ? ownAthleteId : "",
    });
    setDialogOpen(true);
  }, [isAtlet, ownAthleteId]);

  const openEditDialog = useCallback(
    (achievement: any) => {
      setEditingId(achievement._id);
      setForm({
        athlete:
          typeof achievement.athlete === "object"
            ? achievement.athlete._id
            : achievement.athlete || "",
        title: achievement.title || "",
        description: achievement.description || "",
        date: achievement.date ? new Date(achievement.date).toISOString().split("T")[0] : "",
        category: achievement.category || "",
        level: achievement.level || "",
        result: achievement.result || "",
      });
      setDialogOpen(true);
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }, []);

  const updateField = useCallback(
    <K extends keyof AchievementForm>(key: K, value: AchievementForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    // Basic validation
    if (!form.athlete) {
      if (isAtlet) {
        toast.error("Profil atlet belum tersedia. Silakan muat ulang halaman.");
      } else {
        toast.error("Pilih atlet terlebih dahulu");
      }
      return;
    }
    if (!form.title.trim()) {
      toast.error("Judul prestasi wajib diisi");
      return;
    }
    if (!form.date) {
      toast.error("Tanggal wajib diisi");
      return;
    }
    if (!form.category) {
      toast.error("Kategori wajib dipilih");
      return;
    }
    if (!form.level) {
      toast.error("Level wajib dipilih");
      return;
    }
    if (!form.result) {
      toast.error("Hasil wajib dipilih");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/achievements/${editingId}` : "/api/achievements";
      const method = editingId ? "PUT" : "POST";

      const payload: Record<string, string> = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        category: form.category,
        level: form.level,
        result: form.result,
      };

      // Only include athlete on create (PUT schema doesn't have athlete)
      if (!editingId) {
        payload.athlete = form.athlete;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan prestasi");
      }

      toast.success(editingId ? "Prestasi berhasil diperbarui!" : "Prestasi berhasil ditambahkan!");
      closeDialog();
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan prestasi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/achievements/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghapus prestasi");
      }
      toast.success("Prestasi berhasil dihapus!");
      setDeleteTarget(null);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus prestasi");
    } finally {
      setDeleting(false);
    }
  };

  const canEditAchievement = (achievement: any) => {
    if (isAdmin || isPelatih) return true;
    if (isAtlet) {
      const createdById = typeof achievement.createdBy === "object"
        ? achievement.createdBy?._id
        : achievement.createdBy;
      if (createdById?.toString() === user?.id) return true;
    }
    return false;
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterLevel, debouncedSearch]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading || profileLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Prestasi Atlet"
          description="Kelola dan pantau pencapaian prestasi atlet dalam berbagai kompetisi."
        />
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Memuat data prestasi...</p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Prestasi Atlet"
        description="Kelola dan pantau pencapaian prestasi atlet dalam berbagai kompetisi."
      >
        {canCreate && (
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={openCreateDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Prestasi
          </Button>
        )}
      </PageHeader>

      {/* Filter Bar */}
      <Card className="border-border bg-card">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari prestasi atau nama atlet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            {/* Category filter */}
            <Select
              value={filterCategory}
              onValueChange={(v) => setFilterCategory(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-full sm:w-44 bg-secondary border-border">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Semua Kategori</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level filter */}
            <Select
              value={filterLevel}
              onValueChange={(v) => setFilterLevel(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-full sm:w-44 bg-secondary border-border">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Semua Level</SelectItem>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Cards Grid */}
      {filteredAchievements.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Belum Ada Prestasi"
          description={
            canCreate
              ? "Belum ada data prestasi yang tercatat. Mulai tambahkan prestasi atlet."
              : "Belum ada data prestasi yang tercatat."
          }
          actionLabel={canCreate ? "Tambah Prestasi" : undefined}
          onAction={canCreate ? openCreateDialog : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement: any) => {
              const resultStyle = getResultStyle(achievement.result);
              const trophyStyle = getTrophyIconStyle(achievement.result);
              const athleteName = achievement.athlete?.name || "Tidak diketahui";
              const showActions = canEditDelete && canEditAchievement(achievement);

              return (
                <Card
                  key={achievement._id}
                  className="border-border bg-card hover:bg-secondary/20 transition-colors group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Trophy icon */}
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            trophyStyle
                          )}
                        >
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                            {achievement.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Medal className="h-3 w-3 shrink-0" />
                            {athleteName}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {showActions && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(achievement)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(achievement)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(achievement.date)}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Category badge */}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          getCategoryStyle(achievement.category)
                        )}
                      >
                        {achievement.category}
                      </span>

                      {/* Level badge */}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          getLevelStyle(achievement.level)
                        )}
                      >
                        <MapPin className="h-2.5 w-2.5 mr-0.5" />
                        {achievement.level}
                      </span>

                      {/* Result badge */}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          resultStyle.bg,
                          resultStyle.text,
                          resultStyle.border
                        )}
                      >
                        <Award className="h-2.5 w-2.5 mr-0.5" />
                        {achievement.result}
                      </span>
                    </div>

                    {/* Description */}
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {truncate(achievement.description, 120)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Menampilkan{" "}
                <span className="font-semibold text-foreground">
                  {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                dari <span className="font-semibold text-foreground">{pagination.total}</span>{" "}
                prestasi
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </Button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  // Show pages around current page
                  let pageNumber: number;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        pageNumber === currentPage && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                  <>
                    <span className="px-1 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(pagination.totalPages)}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  &gt;
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Add / Edit Dialog                                                    */}
      {/* ------------------------------------------------------------------- */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Prestasi" : "Tambah Prestasi Baru"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Athlete Select */}
            <div className="space-y-2">
              <Label htmlFor="athlete">Atlet</Label>
              {isAtlet ? (
                <Input
                  id="athlete"
                  value={
                    profileLoading
                      ? "Memuat..."
                      : user?.name || "Atlet"
                  }
                  disabled
                  className="bg-secondary border-border"
                />
              ) : (
                <Select
                  value={form.athlete}
                  onValueChange={(v) => updateField("athlete", v)}
                  disabled={!!editingId}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih atlet" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {allAthletes.map((a: any) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name} {a.category ? `(${a.category})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Prestasi</Label>
              <Input
                id="title"
                placeholder="Contoh: Juara Turnamen Bulu Tangkis Nasional 2024"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tentang prestasi yang diraih..."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="bg-secondary border-border min-h-[80px] resize-none"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* Category & Level — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => updateField("category", v)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => updateField("level", v)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Result */}
            <div className="space-y-2">
              <Label>Hasil</Label>
              <Select
                value={form.result}
                onValueChange={(v) => updateField("result", v)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Pilih hasil" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {RESULTS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Batal
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? editingId
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Tambah Prestasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------- */}
      {/* Delete Confirmation Dialog                                           */}
      {/* ------------------------------------------------------------------- */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Hapus Prestasi</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus prestasi{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.title}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

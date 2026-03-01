"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, UserCheck, HeartPulse, Star, Search, SlidersHorizontal, Download, MoreVertical, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { useAthletes } from "@/hooks/use-athletes";
import { useSession } from "@/hooks/use-session";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { toast } from "sonner";

const tabs = [
  { label: "Semua Atlet", value: "all" },
  { label: "Pra Usia Dini", value: "Pra Usia Dini" },
  { label: "Usia Dini", value: "Usia Dini" },
  { label: "Anak-anak", value: "Anak-anak" },
  { label: "Pemula", value: "Pemula" },
  { label: "Remaja", value: "Remaja" },
  { label: "Taruna", value: "Taruna" },
  { label: "Dewasa", value: "Dewasa" },
  { label: "Daftar Cedera", value: "injury" },
];

export default function DataAtletPage() {
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const canEdit = sessionUser?.role === "Admin" || sessionUser?.role === "Pelatih";
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const hookParams: { search?: string; category?: string; status?: string; page: number; limit: number } = {
    page: currentPage,
    limit: 10,
  };
  if (debouncedSearch) hookParams.search = debouncedSearch;
  if (activeTab !== "all" && activeTab !== "injury") {
    hookParams.category = activeTab;
  } else if (activeTab === "injury") {
    hookParams.status = "Pemulihan";
  }

  const { athletes, pagination, isLoading, mutate } = useAthletes(hookParams);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/athletes/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus atlet");
      toast.success("Atlet berhasil dihapus!");
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error("Gagal menghapus atlet");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Manajemen</span>
        <span className="text-muted-foreground/50">&gt;</span>
        <span className="text-primary">Atlet</span>
      </div>

      <PageHeader
        title="Daftar Master Data Atlet"
        description="Direktori terpusat untuk mengelola roster klub, melacak status performa, dan memantau klasifikasi atlet."
      >
        {canEdit && (
          <Link href="/data-atlet/tambah">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Atlet Baru
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL ATLET" value={pagination.total} icon={Users} />
        <StatCard title="STATUS AKTIF" value={athletes.filter((a: any) => a.status === "Aktif").length} icon={UserCheck} iconColor="text-green-400" />
        <StatCard title="DALAM PEMULIHAN" value={athletes.filter((a: any) => a.status === "Pemulihan").length} icon={HeartPulse} iconColor="text-orange-400" />
        <StatCard title="ROSTER PRO" value={athletes.filter((a: any) => a.status === "Pro Roster").length} icon={Star} iconColor="text-yellow-400" />
      </div>

      {/* Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari atlet..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-64 bg-secondary border-border"
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Athletes Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usia</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategori</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Posisi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete: { _id: string; customId: string; name: string; age: number; category: string; position: string; status: string }) => (
                  <tr
                    key={athlete._id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/data-atlet/${athlete._id}`} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {(athlete as any).photo && (
                            <AvatarImage src={(athlete as any).photo} alt={athlete.name} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {athlete.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{athlete.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {athlete.customId}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{athlete.age}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={athlete.category} />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{athlete.position}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={athlete.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => router.push(`/data-atlet/${athlete._id}`)}>
                            Lihat Detail
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => router.push(`/data-atlet/${athlete._id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => router.push(`/monitoring-performa/${athlete._id}`)}>
                            Lihat Performa
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(athlete)}>
                              Hapus
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {athletes.length === 0 && !isLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Tidak ada data atlet ditemukan.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-semibold text-foreground">
                {athletes.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-{Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> dari{" "}
              <span className="font-semibold text-foreground">{pagination.total}</span> atlet
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
              {(() => {
                const totalPages = pagination.totalPages;
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push("...");
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (currentPage < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((page, idx) =>
                  typeof page === "string" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      className={cn("h-8 w-8", page === currentPage && "bg-primary text-primary-foreground")}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                );
              })()}
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Hapus Atlet</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus atlet{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

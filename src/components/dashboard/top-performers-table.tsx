"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/use-dashboard";

export function TopPerformersTable() {
  const { stats, isLoading } = useDashboardStats();
  const performers = stats?.topPerformers || [];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-4 text-center">Memuat...</div>;
  }

  if (performers.length === 0) {
    return <div className="text-sm text-muted-foreground py-4 text-center">Belum ada data performa.</div>;
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Atlet</span>
        <span>Kategori</span>
        <span>Performa</span>
        <span>Posisi</span>
      </div>
      {performers.map((p: any) => (
        <div
          key={p._id}
          className="grid grid-cols-4 gap-4 items-center px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {p.name.split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{p.name}</span>
          </div>
          <span className="text-sm text-primary">{p.category}</span>
          <div className="flex items-center gap-2">
            <Progress value={p.avgScore} className="h-2 flex-1 bg-secondary [&>div]:bg-primary" />
            <span className="text-xs font-bold text-primary">{p.avgScore}</span>
          </div>
          <span className="text-sm text-muted-foreground">{p.position}</span>
        </div>
      ))}
    </div>
  );
}

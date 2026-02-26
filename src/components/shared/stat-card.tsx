import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  className?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "up",
  className,
  iconColor,
}: StatCardProps) {
  return (
    <Card className={cn("card-glow border-border bg-card", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Icon className={cn("h-5 w-5", iconColor || "text-primary")} />
          </div>
          {change && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                changeType === "up" && "text-green-400 bg-green-400/10",
                changeType === "down" && "text-red-400 bg-red-400/10",
                changeType === "neutral" && "text-muted-foreground bg-muted"
              )}
            >
              {change}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

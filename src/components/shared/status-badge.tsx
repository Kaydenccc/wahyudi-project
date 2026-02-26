import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  "Aktif": "bg-green-500/10 text-green-400 border-green-500/20",
  "Active": "bg-green-500/10 text-green-400 border-green-500/20",
  "Peak": "bg-green-500/10 text-green-400 border-green-500/20",
  "Pemulihan": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Recovering": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Rising": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Non-Aktif": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "Menunggu": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Pro Roster": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Cedera": "bg-red-500/10 text-red-400 border-red-500/20",
  "Injured": "bg-red-500/10 text-red-400 border-red-500/20",
  "Steady": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Hadir": "bg-green-500/10 text-green-400 border-green-500/20",
  "Izin": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Tidak Hadir": "bg-red-500/10 text-red-400 border-red-500/20",
  "Terjadwal": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Berlangsung": "bg-green-500/10 text-green-400 border-green-500/20",
  "Selesai": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "Dibatalkan": "bg-red-500/10 text-red-400 border-red-500/20",
  "Sembuh": "bg-green-500/10 text-green-400 border-green-500/20",
  "Dalam Pemulihan": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "PRA USIA DINI": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "USIA DINI": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "ANAK-ANAK": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "PEMULA": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "REMAJA": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "TARUNA": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "DEWASA": "bg-primary/10 text-primary border-primary/20",
  "Teknik": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Fisik": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Taktik": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Progres Baik": "bg-green-500/10 text-green-400 border-green-500/20",
  "Stabil": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Perlu Evaluasi": "bg-red-500/10 text-red-400 border-red-500/20",
  "Pasca-Pertandingan": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Latihan": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "RECOVERED": "bg-green-500/10 text-green-400 border-green-500/20",
  "ACTIVE CARE": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        colors,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

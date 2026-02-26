import { Volleyball } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Volleyball className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">B-Club</h1>
            <p className="text-sm text-muted-foreground">Sistem Pembinaan Atlet Bulutangkis</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

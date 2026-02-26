import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="PB. TIGA BERLIAN"
            width={80}
            height={80}
            className="rounded-2xl"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">PB. TIGA BERLIAN</h1>
            <p className="text-sm text-muted-foreground">Sistem Pembinaan Atlet Bulutangkis</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

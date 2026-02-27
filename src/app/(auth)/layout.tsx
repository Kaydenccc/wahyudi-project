import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-2xl space-y-8 px-4">
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
          <Link
            href="/klub"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
          >
            Profil Klub
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

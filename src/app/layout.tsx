import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DynamicFavicon } from "@/components/shared/dynamic-favicon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PB. TIGA BERLIAN | Sistem Pembinaan Atlet Bulutangkis",
  description: "Sistem informasi pembinaan dan monitoring performa atlet bulutangkis",
  metadataBase: new URL("https://sitigaberlian.my.id"),
  openGraph: {
    title: "PB. TIGA BERLIAN | Sistem Pembinaan Atlet Bulutangkis",
    description: "Sistem informasi pembinaan dan monitoring performa atlet bulutangkis",
    siteName: "PB. TIGA BERLIAN",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PB. TIGA BERLIAN | Sistem Pembinaan Atlet Bulutangkis",
    description: "Sistem informasi pembinaan dan monitoring performa atlet bulutangkis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <DynamicFavicon />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Coffee } from "lucide-react";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNav } from "@/components/bottom-nav";
import { FeedbackButton } from "@/components/feedback-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetBarista — Precision Espresso Control",
  description:
    "The open community control plane for Meticulous espresso machines. Browse profiles, monitor shots, share data.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://metbarista.com"),
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MetBarista",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // respect iPhone notch & home bar safe areas
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background overflow-x-hidden">
        {/* Top navbar — desktop md+ */}
        <Navbar />
        {/* Mobile header — logo + connection dot */}
        <MobileHeader />
        {/* Main content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-0">
          {children}
        </main>
        {/* Footer — desktop only */}
        <footer className="hidden md:block border-t border-white/[0.05] bg-[#0a0807]">
          <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F5C444]/15">
                <Coffee className="h-3 w-3 text-[#F5C444]" />
              </div>
              <span className="text-sm font-semibold text-[#f5f0ea]/60">MetBarista</span>
            </div>
            <p className="text-xs text-[#f5f0ea]/25 text-center">
              Built by{" "}
              <a href="https://nakashon.com" target="_blank" rel="noopener noreferrer"
                className="text-[#f5f0ea]/45 hover:text-[#e8944a] transition-colors">
                Asaf Nakash
              </a>{" "}
              · MIT License · Free forever
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#f5f0ea]/15">
                {process.env.NEXT_PUBLIC_APP_VERSION ? `v${process.env.NEXT_PUBLIC_APP_VERSION}` : ""}{" "}
                {process.env.NEXT_PUBLIC_APP_SHA ? `(${process.env.NEXT_PUBLIC_APP_SHA})` : ""}
              </span>
              <a href="https://github.com/nakashon/metbarista" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#f5f0ea]/25 hover:text-[#f5f0ea]/50 transition-colors">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Star on GitHub
              </a>
            </div>
          </div>
        </footer>
        {/* Bottom nav — mobile/tablet only */}
        <BottomNav />
        {/* Feedback — visible after machine connected */}
        <FeedbackButton />
        {/* Cloudflare Web Analytics */}
        {process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN}"}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

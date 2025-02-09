import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TopBar } from "@/components/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frogstats Analytics",
  description: "Analytics dashboard for your web applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body
        className={`${inter.className} h-full bg-background text-foreground`}
      >
        <script
          type="module"
          defer
          src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/zoomies.js"
        ></script>
        <ThemeProvider>
          <QueryProvider>
            <div className="min-h-full">
              <TopBar />
              <main className="flex-1">{children}</main>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

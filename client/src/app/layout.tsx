"use client";

import { TopBar } from "@/components/TopBar";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
import { userStore } from "../lib/userStore";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: "Frogstats Analytics",
  description: "Analytics dashboard for your web applications",
};
const publicRoutes = ["/login", "/signup"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isPending } = userStore();

  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !user && !publicRoutes.includes(pathname)) {
      redirect("/login");
    }
  }, [isPending, user, pathname]);

  return (
    <html lang="en" className="h-full dark">
      <body
        className={`${inter.className} h-full bg-background text-foreground`}
      >
        <Toaster />
        {/* The ldrs are very pretty but it's super annoying to load them
        https://github.com/GriffinJohnston/ldrs/blob/main/framework-guides.md#nextjs */}
        <script
          type="module"
          defer
          src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/zoomies.js"
        ></script>
        <script
          type="module"
          defer
          src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/ping.js"
        ></script>
        <QueryProvider>
          {pathname === "/login" || pathname === "/signup" ? (
            <div className="min-h-full flex items-center justify-center">
              {children}
            </div>
          ) : (
            <div className="min-h-full">
              <TopBar />
              <main className="flex min-h-screen flex-col items-center p-4">
                <div className="w-full max-w-6xl">{children}</div>
              </main>
            </div>
          )}
        </QueryProvider>
      </body>
    </html>
  );
}

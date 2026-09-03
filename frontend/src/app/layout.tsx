import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import AccessBoundary from "@/components/AccessBoundary";
import DesktopSidebar from "@/components/DesktopSidebar";
import { LanguageProvider } from "@/lib/language-context";
import OfflineStatus from "@/components/OfflineStatus";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "KrishiNayan - Farmer-first crop care",
  description:
    "From crop photo to clear action - disease detection, weather-aware advice, recovery tracking, and officer alerts for Indian farmers.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <PwaRegister />
            <DesktopSidebar />
            <OfflineStatus />
            <AccessBoundary>{children}</AccessBoundary>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

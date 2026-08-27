import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
<<<<<<< HEAD
import AccessBoundary from "@/components/AccessBoundary";
=======
import { LanguageProvider } from "@/lib/language-context";
>>>>>>> origin/main
import "./globals.css";

export const metadata: Metadata = {
  title: "KrishiNayan - AI Farming Copilot",
  description:
    "From crop photo to clear action - AI disease detection, weather-aware advice, government scheme eligibility, and an AI farmer chatbot for Indian farmers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
<<<<<<< HEAD
        <AuthProvider><AccessBoundary>{children}</AccessBoundary></AuthProvider>
=======
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
>>>>>>> origin/main
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KrishiNayan - AI Farming Copilot",
  description:
    "From crop photo to clear action - AI disease detection, weather-aware advice, government scheme eligibility, and an AI farmer chatbot for Indian farmers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

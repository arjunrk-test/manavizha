import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Manavizha - Find Your Perfect Match",
  description: "Your trusted platform for finding your life partner. Connect with verified profiles and start your journey to forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-josefin antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

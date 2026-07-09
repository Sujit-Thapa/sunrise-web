import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sunrise Realty - Find Your Dream Home",
  description: "Discover the perfect property with Sunrise Realty",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

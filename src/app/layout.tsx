import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://something-roan.vercel.app"
  ),
  title: {
    default: "Opportunity AI — Verified Student Opportunity Discovery & Career Platform",
    template: "%s | Opportunity AI",
  },
  description:
    "Discover verified internships, scholarships, research programmes, and hackathons tailored to your education, skills, and career goals with transparent, explainable AI matching.",
  keywords: [
    "student internships",
    "scholarships",
    "hackathons",
    "research fellowships",
    "college career guidance",
    "explainable AI matching",
    "India students",
    "GSoC",
    "PMRF",
  ],
  authors: [{ name: "Opportunity AI" }],
  openGraph: {
    title: "Opportunity AI — Verified Student Opportunity Discovery & Career Platform",
    description:
      "Stop searching across fragmented portals. Access verified internships, scholarships, and hackathons with transparent, source-grounded AI matching.",
    url: "https://something-roan.vercel.app",
    siteName: "Opportunity AI",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Opportunity AI - Verified Student Opportunity Discovery Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunity AI — Verified Student Opportunity Discovery",
    description:
      "Verified internships, scholarships, research programmes, and hackathons with explainable AI matching.",
    creator: "@OpportunityAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

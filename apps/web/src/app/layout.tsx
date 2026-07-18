import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { display, mono, sans } from "@/lib/fonts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Divyam Tyagi — AI Backend Engineer",
    template: "%s · Divyam Tyagi",
  },
  description:
    "AI Backend Engineer specialising in Python, FastAPI, and production RAG systems — building the infrastructure that makes LLMs reliable, fast, and cost-efficient at scale.",
  openGraph: {
    type: "website",
    siteName: "Divyam Tyagi",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

import { Bricolage_Grotesque, Geist, IBM_Plex_Mono } from "next/font/google";

// Three roles, loaded once, self-hosted by next/font (zero layout shift, no CDN call):
// display carries personality, sans carries reading, mono carries data.
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

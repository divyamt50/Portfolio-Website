import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/colophon`, changeFrequency: "yearly", priority: 0.4 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

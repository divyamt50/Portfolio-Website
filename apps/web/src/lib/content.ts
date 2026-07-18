import { experience as localExperience } from "@/content/experience";
import { projects as localProjects } from "@/content/projects";
import { site as localSite } from "@/content/site";
import { skills as localSkills } from "@/content/skills";
import type { Experience, Post, Project, Site, Skill } from "@/lib/types";

// The publish/serve split (architecture doc, Decision 1): pages are generated
// from this layer at build/revalidate time. "local" ships today with zero
// backend; "api" reads the FastAPI control plane once it is deployed.
const SOURCE = process.env.CONTENT_SOURCE ?? "local";
const API = process.env.API_BASE_URL ?? "http://localhost:8000";

async function fromApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate: 300, tags: ["content"] },
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const contentSource = SOURCE;

export async function getSite(): Promise<Site> {
  if (SOURCE === "api") {
    const { data } = await fromApi<{ data: Site }>("/api/v1/settings");
    return data;
  }
  return localSite;
}

export async function getProjects(): Promise<Project[]> {
  if (SOURCE === "api") return fromApi<Project[]>("/api/v1/projects");
  return localProjects;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (SOURCE === "api") {
    try {
      return await fromApi<Project>(`/api/v1/projects/${slug}`);
    } catch {
      return undefined;
    }
  }
  return localProjects.find((p) => p.slug === slug);
}

export async function getSkills(): Promise<Skill[]> {
  if (SOURCE === "api") return fromApi<Skill[]>("/api/v1/skills");
  return localSkills;
}

type ApiExperience = {
  company: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  highlights: string[];
};

function formatPeriod(start: string, end: string | null): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

export async function getExperience(): Promise<Experience[]> {
  if (SOURCE === "api") {
    const rows = await fromApi<ApiExperience[]>("/api/v1/experience");
    return rows.map((r) => ({
      company: r.company,
      title: r.title,
      location: r.location ?? undefined,
      period: formatPeriod(r.start_date, r.end_date),
      highlights: r.highlights,
    }));
  }
  return localExperience;
}

export async function getPosts(): Promise<Post[]> {
  if (SOURCE === "api") return fromApi<Post[]>("/api/v1/posts");
  return []; // Writing section stays hidden until real posts exist — no graveyard.
}

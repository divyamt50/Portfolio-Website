// Hand-written mirror of the API read schemas. Replaced by a generated client
// (packages/api-client) in the auth sprint — see architecture doc §4.

export type Metric = { label: string; value: string };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  featured: boolean;
  tech_stack: string[];
  links: { github?: string; live?: string; docs?: string };
  metrics: Metric[];
  body_mdx: string;
};

export type Skill = { name: string; category: "languages" | "frameworks" | "infra" | "ai" };

export type Experience = {
  company: string;
  title: string;
  location?: string;
  period: string;
  highlights: string[];
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  reading_time_minutes: number;
};

export type Site = {
  name: string;
  headline: string;
  about_mdx: string;
  location: string;
  availability: string;
  email?: string;
  phone?: string;
  resume_url?: string;
  socials: { github?: string; linkedin?: string; email?: string };
};

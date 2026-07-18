import type { Site } from "@/lib/types";

// Source of truth: Divyam_s_Resume.pdf (July 2026) + original brief.
// When CONTENT_SOURCE=api this file becomes the build-time fallback.
export const site: Site = {
  name: "Divyam Tyagi",
  headline:
    "AI Backend Engineer specialising in Python, FastAPI, and production RAG systems — building the infrastructure that makes LLMs reliable, fast, and cost-efficient at scale.",
  about_mdx:
    "I'm a backend engineer with 4+ years of experience designing and scaling high-throughput, AI-powered systems in Python. I'm currently a Backend Lead (SDE II) at Irish Taylor, where I lead a team of 7 engineers building a large-scale RAG platform — owning the architecture, API design, engineering standards, and delivery.\n\nMy focus is production AI infrastructure: retrieval pipelines, semantic caching, model routing, and the unglamorous work of making LLM systems fast, observable, and affordable.",
  location: "Pune, India",
  email: "divyamt100@gmail.com",
  phone: "+91 70373 64942",
  resume_url: "/resume/Divyam-Tyagi-Resume.pdf",
  socials: {
    github: "https://github.com/divyamt50",
    linkedin: "https://www.linkedin.com/in/divyam-tyagi/",
    email: "divyamt100@gmail.com",
  },
};

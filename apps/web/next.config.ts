import type { NextConfig } from "next";

const config: NextConfig = {
  // Every public page is static (SSG/ISR). No runtime backend dependency —
  // see docs/portfolio-architecture.md, Decision 1.
};

export default config;

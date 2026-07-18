// Offline stand-in used only when building in a network-restricted sandbox
// (next/font/google needs fonts.googleapis.com at build time). The CSS tokens
// fall back to system stacks. CI and Vercel use the real fonts.ts.
const shim = (v: string) => ({ variable: v, className: "" });

export const display = shim("font-shim-display");
export const sans = shim("font-shim-sans");
export const mono = shim("font-shim-mono");

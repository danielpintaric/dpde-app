export const SITE_SECTIONS = [
  { id: "site", label: "Site" },
  { id: "navigation", label: "Navigation" },
  { id: "hero", label: "Hero" },
  { id: "featured", label: "Featured Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
] as const;

export type SiteSectionId = (typeof SITE_SECTIONS)[number]["id"];

export const SITE_SECTION_IDS: readonly string[] = SITE_SECTIONS.map((s) => s.id);

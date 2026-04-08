import type { SiteSectionId } from "@/lib/admin/site-sections";

export type SiteSectionIntro = {
  label: string;
  title: string;
  description: string;
};

export const SITE_SECTION_INTRO: Record<SiteSectionId, SiteSectionIntro> = {
  site: {
    label: "Site",
    title: "Identity and structure",
    description:
      "Set the core elements of your site, including brand name, logo and basic structure.",
  },
  navigation: {
    label: "Navigation",
    title: "Primary wayfinding",
    description:
      "Define how visitors move through your site. Keep labels short and intuitive.",
  },
  hero: {
    label: "Hero",
    title: "First impression",
    description:
      "Shape the opening moment of your site. Keep it clear, strong and visually cohesive.",
  },
  featured: {
    label: "Featured work",
    title: "Curated highlights",
    description:
      "Select projects that best represent your style and quality. Focus on clarity over quantity.",
  },
  about: {
    label: "About",
    title: "Personal context",
    description:
      "Give visitors a sense of who you are and how you work, without overwhelming detail.",
  },
  contact: {
    label: "Contact",
    title: "Reachability",
    description:
      "Make it easy for people to get in touch. Only include channels you actively use.",
  },
  footer: {
    label: "Footer",
    title: "Secondary structure",
    description:
      "Provide supporting navigation and essential information in a clean and minimal layout.",
  },
};

export function getSiteSectionIntro(sectionId?: string | null): SiteSectionIntro {
  if (!sectionId) {
    return SITE_SECTION_INTRO.site;
  }
  return SITE_SECTION_INTRO[sectionId as SiteSectionId] ?? SITE_SECTION_INTRO.site;
}

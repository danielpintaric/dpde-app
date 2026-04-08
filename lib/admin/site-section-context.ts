import type { SiteSectionId } from "@/lib/admin/site-sections";

export type SiteSectionContext = {
  eyebrow: string;
  title: string;
  description: string;
  tips?: string[];
  notes?: string[];
  checklist?: string[];
};

export const SITE_SECTION_CONTEXT: Record<SiteSectionId, SiteSectionContext> = {
  site: {
    eyebrow: "Foundation",
    title: "Identity and structure",
    description:
      "Set the public-facing basics: brand name, wordmark, logo, and copyright. These choices shape recognition everywhere—from the header to the footer—and should stay consistent over time.",
    tips: [
      "Keep the brand name aligned with how you introduce yourself elsewhere.",
      "Use a wordmark only if it reads clearly at small sizes.",
      "Add a logo URL when the asset is final, optimized, and display-ready.",
    ],
    notes: ["Small inconsistencies here are more visible than they look."],
  },
  navigation: {
    eyebrow: "Wayfinding",
    title: "Header navigation",
    description:
      "These links define how visitors move through the site. Clear labels and a restrained set of visible items reduce noise and help people find what matters.",
    tips: [
      "Prefer short, plain labels over clever ones.",
      "Hide rows you do not need; empty slots are fine.",
      "The optional header CTA works best as a single, obvious next step.",
    ],
    checklist: [
      "Every visible link has a destination that still exists.",
      "No more than one competing primary action in the header.",
    ],
  },
  hero: {
    eyebrow: "First impression",
    title: "Homepage hero",
    description:
      "The hero is what people see first. A tight title, a calm subtitle, and cohesive images set the tone; the slideshow timing should feel steady, not rushed.",
    tips: [
      "Lead with a title that fits in one line on most screens.",
      "Choose images that share light, grain, or palette so the sequence feels intentional.",
      "Use one or two CTAs—only as many as you would point to in conversation.",
    ],
    notes: ["If every slot is empty, the site can fall back to a default image after save."],
  },
  featured: {
    eyebrow: "Homepage curation",
    title: "Featured work",
    description:
      "This block showcases the work you want to be known for. A strong lead tile and two supports read as a deliberate statement, not a full archive.",
    tips: [
      "Favor projects that show range without diluting your visual voice.",
      "Let “More work” stay automatic unless you need a specific order.",
      "Revisit picks after new projects ship.",
    ],
    checklist: ["Featured projects still match the story you want today."],
  },
  about: {
    eyebrow: "Point of view",
    title: "About on the homepage",
    description:
      "The approach block is where your perspective comes through. It should invite trust with a calm tone—enough personality to feel human, not enough to feel like a diary.",
    tips: [
      "Write for someone skimming: short lines, one clear idea per paragraph.",
      "Match the tone of your portfolio and contact copy.",
      "Use the optional CTA only when it leads somewhere meaningful.",
    ],
    notes: ["Turn off sections you are not ready to stand behind yet."],
  },
  contact: {
    eyebrow: "Reachability",
    title: "Contact details",
    description:
      "What you list here should lower friction: a primary email, optional phone, and social links you actually check. Everything else adds doubt.",
    tips: [
      "Use an inbox you monitor regularly.",
      "Add Instagram only if you want inquiries there.",
      "Keep location and bio lines accurate—they often travel beyond this page.",
    ],
    checklist: ["No channel you would not want a client to use today."],
  },
  footer: {
    eyebrow: "Closing frame",
    title: "Footer",
    description:
      "The footer is the quiet end of the page: a line of context, one main action, and a secondary link if needed. It should feel calm and easy to scan.",
    tips: [
      "Keep the description to a sentence or two.",
      "One primary CTA is enough; extras should earn their place.",
      "Avoid stacking redundant links from the header.",
    ],
    notes: ["A cluttered footer makes the whole site feel heavier than it is."],
  },
};

export function getSiteSectionContext(sectionId: string | null | undefined): SiteSectionContext {
  if (sectionId && sectionId in SITE_SECTION_CONTEXT) {
    return SITE_SECTION_CONTEXT[sectionId as SiteSectionId];
  }
  return SITE_SECTION_CONTEXT.site;
}

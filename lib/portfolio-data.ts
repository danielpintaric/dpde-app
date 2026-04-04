export type GalleryLayoutType = "cinematic" | "grid" | "mixed";

export type ProjectImage = {
  /** Unsplash (or other) URL — required for real frames */
  src: string;
  /** Tailwind aspect utility, e.g. aspect-[16/10] */
  aspectClass: string;
  caption?: string;
  /** CSS object-position for editorial crop */
  objectPosition?: string;
};

export type PortfolioProject = {
  title: string;
  slug: string;
  category: string;
  year: string;
  location: string;
  intro: string;
  layoutType: GalleryLayoutType;
  coverImage: string;
  images: ProjectImage[];
};

/** Consistent remote asset URL (width for visual parity across breakpoints). */
export function asset(photoPath: string, w = 1800): string {
  return `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=82`;
}

/** Opening portrait after hero — file in `public/images/` (winter-portrait project lead on detail too). */
export const HOME_OPENING_PORTRAIT_SRC = "/images/home-opening-portrait.png";

/** Recent pieces mosaic — top-right stack slot (homepage only; still links to `studio-form`). */
export const HOME_MOSAIC_STACK_PORTRAIT_SRC = "/images/recent-mosaic-bw-portrait.png";

/** Recent pieces mosaic — large left / row-span cell (links to `quiet-portraits`). */
export const HOME_MOSAIC_DOMINANT_SRC = "/images/recent-mosaic-dominant-portrait.png";

/** Recent pieces mosaic — lower stack slot (row 2 right); warm editorial, links to `winter-portrait`. */
export const HOME_MOSAIC_WINTER_STACK_SRC = "/images/recent-mosaic-warm-editorial.png";

/** Recent pieces mosaic — bottom row, half-width portrait tiles (3:4). */
export const HOME_MOSAIC_WIDE_HORSE_SRC = "/images/recent-mosaic-horse-editorial.png";
export const HOME_MOSAIC_WIDE_RED_DUO_SRC = "/images/recent-mosaic-red-duo-editorial.png";

/** Recent pieces mosaic — row 4 under horse/red pair; both 3:4. */
export const HOME_MOSAIC_CAMPAIGN_SOFA_SRC = "/images/recent-mosaic-campaign-sofa.png";
export const HOME_MOSAIC_PROFILE_SPLIT_SRC = "/images/recent-mosaic-profile-split.png";

/** Homepage wide rail after portrait — triptych / editorial plate in `public/images/`. */
export const HOME_WIDE_PLATE_SRC = "/images/home-wide-editorial-triptych.png";
/** Homepage — portrait (3:4) under `widePlate`; same `widePlateSlug` link. */
export const HOME_WIDE_PLATE_FOLLOW_SRC = "/images/home-wide-follow-urban-golden.png";

/** Homepage — quiet block row 1 left (hat); pair with `HOME_WIDE_BELOW_BESIDE_SRC`. */
export const HOME_WIDE_BELOW_PLATE_SRC = "/images/home-below-wide-editorial-hat.png";
/** Homepage — quiet block row 1 right (rim light); same link as `widePlateBelow`. */
export const HOME_WIDE_BELOW_BESIDE_SRC = "/images/home-quiet-beside-rim-halo.png";

/** Homepage — pair under `widePlateBelow`, same slug (`widePlateBelowSlug`). */
export const HOME_QUIET_PAIR_ORANGE_SRC = "/images/home-quiet-pair-orange-glasses.png";
export const HOME_QUIET_PAIR_STRAW_SRC = "/images/home-quiet-pair-straw-hat.png";

/** Homepage duo block — left wide plate + right vertical (both in `public/images/`). */
export const HOME_DUO_FIRST_SRC = "/images/home-duo-editorial-work-smart.png";
export const HOME_DUO_SECOND_SRC = "/images/home-duo-editorial-red-aviator.png";

const IMAGES = {
  cinematicLong: "aspect-[9/16] sm:aspect-[3/4]",
  cinematicWide: "aspect-[16/10] sm:aspect-[2/1]",
  cinematicHero: "aspect-[4/5] sm:aspect-[21/9]",
  gridSquare: "aspect-square",
  gridPortrait: "aspect-[3/4]",
  gridWide: "aspect-[4/3]",
  mixedHero: "aspect-[4/5] sm:aspect-[16/10]",
  mixedTall: "aspect-[3/4] sm:aspect-[2/3]",
} as const;

export const HOME_FEATURED_SLUGS = ["tokyo-nights", "studio-form", "coastal-silence"] as const;

export function getHomeFeaturedProjects(): {
  slug: string;
  title: string;
  category: string;
  image: string;
}[] {
  return HOME_FEATURED_SLUGS.map((slug) => {
    const p = PORTFOLIO_PROJECTS.find((x) => x.slug === slug)!;
    return { slug: p.slug, title: p.title, category: p.category, image: p.coverImage };
  });
}

/** Featured strip on homepage — cover + second frame for editorial duo layouts */
export function getHomeFeaturedEditorial(): {
  slug: string;
  title: string;
  category: string;
  image: string;
  secondarySrc?: string;
}[] {
  return HOME_FEATURED_SLUGS.map((slug) => {
    const p = PORTFOLIO_PROJECTS.find((x) => x.slug === slug)!;
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: p.coverImage,
      secondarySrc: p.images[1]?.src,
    };
  });
}

export type HomeWorkPreviewFrame = {
  src: string;
  slug: string;
  /** Optional `img` classes (e.g. `object-[center_42%]` when the plate is wide but the file is portrait). */
  imgClassName?: string;
};

/**
 * Homepage “Recent pieces” mosaic — seven cells; last row is another pair of 3:4 halves below horse/red.
 */
export const HOME_WORK_PREVIEW: readonly HomeWorkPreviewFrame[] = [
  { src: HOME_MOSAIC_DOMINANT_SRC, slug: "quiet-portraits" },
  { src: HOME_MOSAIC_STACK_PORTRAIT_SRC, slug: "studio-form" },
  { src: HOME_MOSAIC_WINTER_STACK_SRC, slug: "winter-portrait" },
  {
    src: HOME_MOSAIC_WIDE_HORSE_SRC,
    slug: "coastal-silence",
    imgClassName: "object-[center_45%]",
  },
  {
    src: HOME_MOSAIC_WIDE_RED_DUO_SRC,
    slug: "atelier-campaign",
    imgClassName: "object-[center_45%]",
  },
  {
    src: HOME_MOSAIC_CAMPAIGN_SOFA_SRC,
    slug: "atelier-campaign",
    imgClassName: "object-[center_45%]",
  },
  {
    src: HOME_MOSAIC_PROFILE_SPLIT_SRC,
    slug: "quiet-portraits",
    imgClassName: "object-[center_45%]",
  },
];

/** Full-bleed hero — matches Post-midnight cover, cool low luminance */
export const HOME_HERO_IMAGE = asset("photo-1477346611705-65d1883cee1e", 2400);

/** About page (and home Approach teaser) — local file in `public/images/`. */
export const ABOUT_STUDIO_IMAGE = "/images/about-studio-portrait.png";

/**
 * Homepage-only frames (easy swap). Use full URLs, or paths under /public e.g. "/images/coast-wide.jpg".
 * duo: [0] = wide / landscape plate, [1] = vertical companion — both link to `duoSlug`.
 */
export const homepageImages = {
  /** Same file as cover for Frost partition / homepage opening plate. */
  openingPlateSrc: HOME_OPENING_PORTRAIT_SRC,
  /** Wide rail after portrait — links to campaign project; swap file or slug in one place. */
  widePlateSlug: "atelier-campaign",
  widePlate: HOME_WIDE_PLATE_SRC,
  widePlateFollow: HOME_WIDE_PLATE_FOLLOW_SRC,
  /** Portrait under wide rail — links to `widePlateBelowSlug`. */
  widePlateBelowSlug: "quiet-portraits",
  widePlateBelow: HOME_WIDE_BELOW_PLATE_SRC,
  widePlateBelowBeside: HOME_WIDE_BELOW_BESIDE_SRC,
  /** Two 3:4 tiles directly under `widePlateBelow`; both link to `widePlateBelowSlug`. */
  wideBelowPair: [HOME_QUIET_PAIR_ORANGE_SRC, HOME_QUIET_PAIR_STRAW_SRC] as const,
  /** Pair reads as one editorial set — both frames are campaign-adjacent. */
  duoSlug: "atelier-campaign",
  duo: [HOME_DUO_FIRST_SRC, HOME_DUO_SECOND_SRC],
} as const;

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    title: "Post-midnight",
    slug: "tokyo-nights",
    category: "Editorial",
    year: "2024",
    location: "Tokyo",
    intro:
      "A night edit after a day on assignment in Shinjuku: voltage at the crossings, then pockets where humidity and neon separate. Not street theatre — intervals between one decision and the next.",
    layoutType: "cinematic",
    coverImage: asset("photo-1477346611705-65d1883cee1e"),
    images: [
      {
        src: asset("photo-1540959733332-eab4deabeeaf"),
        aspectClass: IMAGES.cinematicHero,
        caption: "Crossing — heat still in the tarmac",
        objectPosition: "center 45%",
      },
      {
        src: asset("photo-1542051841857-5f90071e7989"),
        aspectClass: IMAGES.cinematicLong,
        objectPosition: "center 38%",
      },
      {
        src: asset("photo-1549692520-acc6669e2f0c"),
        aspectClass: IMAGES.cinematicWide,
        caption: "Residual neon, wet brick",
        objectPosition: "center 40%",
      },
      {
        src: asset("photo-1528360983277-13d401cdc186"),
        aspectClass: IMAGES.cinematicLong,
        caption: "Narrow light — humidity in the alley",
        objectPosition: "center 42%",
      },
      {
        src: asset("photo-1480714378408-67cf0d13bc1b"),
        aspectClass: IMAGES.cinematicWide,
        caption: "City plate — residual glow",
        objectPosition: "center 52%",
      },
    ],
  },
  {
    title: "Day room",
    slug: "quiet-portraits",
    category: "Portrait",
    year: "2025",
    location: "Berlin",
    intro:
      "Sittings in a top-floor room in Kreuzberg: north glass, a single chair, almost no prompting. The sitting runs until the face forgets the camera.",
    layoutType: "grid",
    coverImage: HOME_MOSAIC_DOMINANT_SRC,
    images: [
      {
        src: HOME_MOSAIC_DOMINANT_SRC,
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 35%",
      },
      {
        src: asset("photo-1544005313-94ddf0286df2"),
        aspectClass: IMAGES.gridPortrait,
        caption: "First hour, skim light",
        objectPosition: "center 35%",
      },
      {
        src: asset("photo-1519741497674-611481863552"),
        aspectClass: IMAGES.gridWide,
        objectPosition: "center 40%",
      },
      {
        src: asset("photo-1522335789203-aabd1fc54bc9"),
        aspectClass: IMAGES.cinematicWide,
        objectPosition: "center 32%",
      },
      {
        src: asset("photo-1529626455594-4ff0802cfb7e"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 30%",
      },
      {
        src: asset("photo-1534528741775-53994a69daeb"),
        aspectClass: IMAGES.gridPortrait,
        caption: "Hold, no cue",
        objectPosition: "center 28%",
      },
      {
        src: asset("photo-1494790108377-be9c29b29330"),
        aspectClass: IMAGES.gridWide,
        objectPosition: "center 20%",
      },
      {
        src: asset("photo-1506794778202-cad84cf45f1d"),
        aspectClass: IMAGES.cinematicWide,
        objectPosition: "center 18%",
      },
    ],
  },
  {
    title: "Mass and recess",
    slug: "studio-form",
    category: "Architecture",
    year: "2024",
    location: "Milan",
    intro:
      "Interiors for a Northern Italian manufacturer — terrazzo, ash, linen planes. The brief was to keep volume and shadow legible; colour temperature barely moves frame to frame.",
    layoutType: "mixed",
    coverImage: asset("photo-1558618666-fcd25c85cd64"),
    images: [
      {
        src: asset("photo-1558618666-fcd25c85cd64"),
        aspectClass: IMAGES.mixedHero,
        caption: "Lead plate — stairwell, walnut handrail",
        objectPosition: "center 45%",
      },
      {
        src: asset("photo-1618221195710-dd6b41faaea6"),
        aspectClass: IMAGES.mixedHero,
        objectPosition: "center 48%",
      },
      {
        src: asset("photo-1503387762-592deb58ef4e"),
        aspectClass: IMAGES.gridWide,
        objectPosition: "center 55%",
      },
      {
        src: asset("photo-1600585154526-990dced4db0d"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 45%",
      },
      {
        src: asset("photo-1631679706909-1844bbd07221"),
        aspectClass: IMAGES.gridWide,
        objectPosition: "center 42%",
      },
      {
        src: asset("photo-1600121848594-d8644e57abab"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 50%",
      },
      {
        src: asset("photo-1616594039964-ae9021a400a0"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 48%",
      },
    ],
  },
  {
    title: "Channel notebook",
    slug: "coastal-silence",
    category: "Personal",
    year: "2023",
    location: "Normandy",
    intro:
      "The same tide line revisited over three winter weeks: flat grey, wet sand, no hero weather. A notebook in pictures — margin notes by salt and horizon.",
    layoutType: "cinematic",
    coverImage: asset("photo-1505142468610-359e7d316be0"),
    images: [
      {
        src: asset("photo-1505142468610-359e7d316be0"),
        aspectClass: IMAGES.cinematicWide,
        objectPosition: "center 42%",
      },
      {
        src: asset("photo-1507525428034-b723cf961d3e"),
        aspectClass: IMAGES.cinematicLong,
        caption: "Before sun — water withdrawn",
        objectPosition: "center 58%",
      },
      {
        src: asset("photo-1470071459604-3b5ec3a7fe05"),
        aspectClass: IMAGES.cinematicWide,
        objectPosition: "center 35%",
      },
      {
        src: asset("photo-1467269204594-9661b134dd2b"),
        aspectClass: IMAGES.cinematicLong,
        objectPosition: "center 38%",
      },
    ],
  },
  {
    title: "Frost partition",
    slug: "winter-portrait",
    category: "Portrait",
    year: "2024",
    location: "Berlin",
    intro:
      "One wall, one pane of patterned glass, winter daylight flat on the floor. The commission was to stay until the room and the sitter fell into the same tempo.",
    layoutType: "grid",
    coverImage: HOME_OPENING_PORTRAIT_SRC,
    images: [
      {
        src: HOME_OPENING_PORTRAIT_SRC,
        aspectClass: IMAGES.gridPortrait,
        caption: "Plate 01",
        objectPosition: "center 45%",
      },
      {
        src: asset("photo-1544005313-94ddf0286df2"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 38%",
      },
      {
        src: asset("photo-1600047509358-9dc75507daeb"),
        aspectClass: IMAGES.cinematicWide,
        objectPosition: "center 48%",
      },
      {
        src: asset("photo-1534528741775-53994a69daeb"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 25%",
      },
      {
        src: asset("photo-1488426862026-3ee34a7d66df"),
        aspectClass: IMAGES.gridWide,
        objectPosition: "center 30%",
      },
      {
        src: asset("photo-1494790108377-be9c29b29330"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 22%",
      },
    ],
  },
  {
    title: "Raw wall season",
    slug: "atelier-campaign",
    category: "Editorial",
    year: "2025",
    location: "Paris",
    intro:
      "Spring collection against bare plaster — fabric fall, shoulder line, and the wall left intentionally unfinished. One stop under a typical catalogue exposure; grain retained for litho.",
    layoutType: "mixed",
    coverImage: asset("photo-1469334031218-e382a71b716b"),
    images: [
      {
        src: asset("photo-1469334031218-e382a71b716b"),
        aspectClass: IMAGES.mixedHero,
        objectPosition: "center 30%",
      },
      {
        src: asset("photo-1539109136881-3be0616acf4b"),
        aspectClass: IMAGES.mixedTall,
        caption: "Look 04 — linen bias",
        objectPosition: "center 35%",
      },
      {
        src: asset("photo-1522335789203-aabd1fc54bc9"),
        aspectClass: IMAGES.gridWide,
        objectPosition: "center 30%",
      },
      {
        src: asset("photo-1515886657613-9f3515b0c78f"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 26%",
      },
      {
        src: asset("photo-1534528741775-53994a69daeb"),
        aspectClass: IMAGES.gridPortrait,
        objectPosition: "center 28%",
      },
      {
        src: asset("photo-1529626455594-4ff0802cfb7e"),
        aspectClass: IMAGES.cinematicWide,
        objectPosition: "center 36%",
      },
    ],
  },
];

export function getPortfolioProjects(): PortfolioProject[] {
  return PORTFOLIO_PROJECTS;
}

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev: PortfolioProject | null;
  next: PortfolioProject | null;
} {
  const list = PORTFOLIO_PROJECTS;
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? list[i - 1]! : null,
    next: i < list.length - 1 ? list[i + 1]! : null,
  };
}

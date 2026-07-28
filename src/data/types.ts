import type { Localized } from '../i18n/utils';

// Content model for the site. These interfaces are the contract the sample
// JSON in this folder fills today and that the Sanity CMS documents will fill
// next — every localized field is a `{ vi, en }` object (see Localized).

export interface PageMeta {
  title: Localized;
  description: Localized;
}

export interface Service {
  id: string;
  title: Localized;
  description: Localized;
}

export interface Project {
  id: string;
  tag: Localized;
  title: Localized;
  description: Localized;
  /** Gradient placeholder class, used until real media is attached. */
  cardClass?: string;
  /** Optional preview video URL; presence enables hover-to-play. */
  video?: string;
  /** Optional poster / still image URL. */
  image?: string;
  /** Surface on the home-page teaser. */
  featured?: boolean;
}

export interface Experience {
  id: string;
  company: Localized;
  role: Localized;
  tags: Localized[];
  outcomes: Localized;
  description: Localized;
  year: Localized;
}

export interface ExplorePanel {
  eyebrow: Localized;
  title: Localized;
  text: Localized;
}

export interface HomeContent {
  meta: PageMeta;
  hero: {
    eyebrow: Localized;
    title: Localized;
    text: Localized;
    stats: { value: string; label: Localized }[];
    reelPill: Localized;
    reelTitle: Localized;
    reelMeta: Localized;
  };
  showreel: {
    eyebrow: Localized;
    title: Localized;
    text: Localized;
    quote: Localized;
    author: string;
  };
  explore: ExplorePanel[];
  servicesTeaser: { eyebrow: Localized; heading: Localized };
  portfolioTeaser: { eyebrow: Localized; heading: Localized };
}

export interface ServicesContent {
  meta: PageMeta;
  eyebrow: Localized;
  heading: Localized;
  items: Service[];
}

export interface ProjectsContent {
  meta: PageMeta;
  eyebrow: Localized;
  heading: Localized;
  items: Project[];
}

export interface AboutContent {
  meta: PageMeta;
  eyebrow: Localized;
  title: Localized;
  paragraphs: Localized[];
  strengths: Localized[];
  skillsEyebrow: Localized;
  skillsHeading: Localized;
  skills: string[];
  experienceEyebrow: Localized;
  experienceHeading: Localized;
  experiences: Experience[];
}

export interface ContactContent {
  meta: PageMeta;
  eyebrow: Localized;
  title: Localized;
  text: Localized;
  email: string;
}

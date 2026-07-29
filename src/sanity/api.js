import { createClient } from '@sanity/client';
import { urlFor } from './image.js';
import { localize } from '../i18n/utils';
import {
  services as servicesData,
  projects as projectsData,
  about as aboutData,
  contact as contactData,
} from '../data';

const PROJECT_ID = import.meta.env.SANITY_PROJECT_ID || 'yrg3sjk0';
const DATASET = import.meta.env.SANITY_DATASET || 'production';
const CONFIGURED = !!PROJECT_ID && PROJECT_ID !== 'placeholder';

const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2025-05-01',
  useCdn: false, // Ensure realtime
});

// Fallback content in src/data is authored bilingually ({ vi, en }); the Sanity
// schema is single-language, so collapse fallbacks to the default locale (vi).
const L = (field) => (field ? localize(field, 'vi') : '');

async function safeFetch(query, params) {
  if (!CONFIGURED) return null;
  try {
    // Disable CDN caching for fetches to get instant real-time data updates (0s delay) when published in Sanity Admin
    return await sanityClient.fetch(query, params, { useCdn: false });
  } catch (e) {
    console.warn('[sanity] fetch failed, using src/data fallback:', e?.message || e);
    return null;
  }
}

// Flatten Portable Text blocks into a short plain-text excerpt for cards.
function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b && b._type === 'block')
    .map((b) => (b.children || []).map((c) => c.text).join(''))
    .join('\n\n')
    .trim();
}

function coverUrl(source, w = 1600, h = 900) {
  if (!source) return null;
  try {
    return urlFor(source).width(w).height(h).fit('crop').auto('format').url();
  } catch {
    return null;
  }
}


// ---------- Services ----------
export async function getServices() {
  const rows = await safeFetch(
    `*[_type == "service"] | order(order asc, _createdAt asc){ "id": _id, title, description, icon }`
  );
  if (rows && rows.length) {
    return rows.map((r) => ({
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      iconUrl: r.icon ? urlFor(r.icon).width(96).height(96).fit('crop').url() : null,
    }));
  }
  return servicesData.items.map((s) => ({
    id: s.id,
    title: L(s.title),
    description: L(s.description),
    iconUrl: null,
  }));
}

// ---------- Projects ----------
// Split flattened Portable Text into trimmed, non-empty paragraphs.
function toParagraphs(blocks) {
  return blocksToText(blocks)
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
}

function fixLocalhostUrl(url) {
  if (typeof url !== 'string') return url;
  return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
}

// Automatically extract high-quality YouTube/Vimeo CDN thumbnail (0s latency)
function getVideoThumbnail(url) {
  if (!url || typeof url !== 'string') return null;
  
  // YouTube
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegExp);
  if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Vimeo
  const vmRegExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vmMatch = url.match(vmRegExp);
  if (vmMatch && vmMatch[1]) {
    const videoId = vmMatch[1];
    return `https://vumbnail.com/${videoId}.jpg`;
  }

  return null;
}

function mapProject(r) {
  const manualCover = coverUrl(r.coverImage);
  const autoVideoCover = getVideoThumbnail(r.mainVideoUrl) || getVideoThumbnail(r.videoHoverUrl);

  return {
    id: r.id,
    title: r.title || '',
    coverImageUrl: manualCover || autoVideoCover,
    // Hover teaser on the card; main video, structured metadata, and full
    // description feed the in-page modal (ProjectModal.astro / portfolio-modal.js).
    videoHoverUrl: fixLocalhostUrl(r.videoHoverUrl) || null,
    videoUrl: fixLocalhostUrl(r.mainVideoUrl) || null,
    client: r.client || null,
    year: r.year ?? null,
    role: r.role || null,
    categories: Array.isArray(r.categories) 
      ? r.categories.map(c => typeof c === 'object' && c !== null ? c.title || c.name : c).filter(Boolean) 
      : [],
    aspectRatio: r.aspectRatio === '9:16' ? '9:16' : '16:9',
    descriptionParagraphs: toParagraphs(r.description),
    cardClass: null,
    featured: !!r.featured,
  };
}

export async function getProjects() {
  const rows = await safeFetch(
    `*[_type == "project"] | order(coalesce(orderRank, "zzz") asc, featured desc, year desc, _createdAt desc){
      "id": _id, title, featured, client, year, role,
      "categories": categories[]->{title},
      aspectRatio, coverImage, videoHoverUrl, mainVideoUrl, description
    }`
  );
  if (rows && rows.length) return rows.map(mapProject);
  return projectsData.items.map((p) => ({
    id: p.id,
    title: L(p.title),
    coverImageUrl: null,
    videoHoverUrl: null,
    videoUrl: null,
    client: null,
    year: null,
    role: null,
    // The bilingual sample "tag" doubles as a single fallback category so the
    // filter has something to work with before Sanity is configured.
    categories: p.tag ? [L(p.tag)] : [],
    aspectRatio: '16:9',
    descriptionParagraphs: [L(p.description)].filter(Boolean),
    cardClass: p.cardClass || null,
    featured: !!p.featured,
  }));
}

export async function getFeaturedProjects(limit = 3) {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getProjectsGroupedByCategory(allProjects = null) {
  if (!allProjects) {
    allProjects = await getProjects();
  }
  const groupMap = new Map();

  allProjects.forEach((project) => {
    const cats = Array.isArray(project.categories) && project.categories.length > 0
      ? project.categories
      : ['Khác'];

    cats.forEach((catName) => {
      if (!groupMap.has(catName)) {
        groupMap.set(catName, []);
      }
      groupMap.get(catName).push(project);
    });
  });

  return Array.from(groupMap.entries()).map(([name, items]) => ({
    name,
    projects: items,
  }));
}

// ---------- Resume experiences ----------
export async function getResumeExperiences() {
  const rows = await safeFetch(
    `*[_type == "resume_experience"] | order(order asc, _createdAt desc){
      "id": _id, company, role, timeframe, skills, outcomes, description
    }`
  );
  if (rows && rows.length) {
    return rows.map((r) => ({
      id: r.id,
      company: r.company || '',
      role: r.role || '',
      timeframe: r.timeframe || '',
      skills: Array.isArray(r.skills) ? r.skills : [],
      outcomes: r.outcomes || '',
      description: r.description || '',
    }));
  }
  return aboutData.experiences.map((e) => ({
    id: e.id,
    company: L(e.company),
    role: L(e.role),
    timeframe: L(e.year),
    skills: (e.tags || []).map(L),
    outcomes: L(e.outcomes),
    description: L(e.description),
  }));
}

// ---------- Resume Page (singleton) ----------
export async function getResumePage() {
  const row = await safeFetch(
    `*[_type == "resume_page"][0]{
      avatar, eyebrow, title, bioText, strengths, skillsHeading, skills, languagesHeading, languages, hobbiesHeading, hobbies, experienceHeading
    }`
  );
  if (row) {
    return {
      avatarUrl: row.avatar ? coverUrl(row.avatar, 600, 600) : null,
      eyebrow: row.eyebrow || L(aboutData.eyebrow),
      title: row.title || L(aboutData.title),
      paragraphs: row.bioText && Array.isArray(row.bioText) ? [blocksToText(row.bioText)] : aboutData.paragraphs.map(L),
      strengths: Array.isArray(row.strengths) && row.strengths.length ? row.strengths : aboutData.strengths.map(L),
      skillsHeading: row.skillsHeading || L(aboutData.skillsHeading),
      skills: Array.isArray(row.skills) && row.skills.length ? row.skills : aboutData.skills,
      languagesHeading: row.languagesHeading || L(aboutData.languagesHeading),
      languages: Array.isArray(row.languages) && row.languages.length ? row.languages : aboutData.languages,
      hobbiesHeading: row.hobbiesHeading || L(aboutData.hobbiesHeading),
      hobbies: Array.isArray(row.hobbies) && row.hobbies.length ? row.hobbies : aboutData.hobbies,
      experienceHeading: row.experienceHeading || L(aboutData.experienceHeading),
    };
  }
  return {
    avatarUrl: null,
    eyebrow: L(aboutData.eyebrow),
    title: L(aboutData.title),
    paragraphs: aboutData.paragraphs.map(L),
    strengths: aboutData.strengths.map(L),
    skillsHeading: L(aboutData.skillsHeading),
    skills: aboutData.skills,
    languagesHeading: L(aboutData.languagesHeading),
    languages: aboutData.languages,
    hobbiesHeading: L(aboutData.hobbiesHeading),
    hobbies: aboutData.hobbies,
    experienceHeading: L(aboutData.experienceHeading),
  };
}

// ---------- Site settings (singleton) ----------
export async function getSiteSettings() {
  const row = await safeFetch(
    `*[_id in ["site_settings", "drafts.site_settings"]] | order(_updatedAt desc)[0]{
      seoTitle, metaDescription, contact, stats, portfolioTeaser, servicesTeaser, contactBanner,
      hero { eyebrow, title, description, videoUrl, videoFile { asset-> { url } }, posterImage }
    }`
  );
  if (row) {
    const directFileUrl = row.hero?.videoFile?.asset?.url || null;
    const rawVideoUrl = directFileUrl || row.hero?.videoUrl || null;

    return {
      seoTitle: row.seoTitle || null,
      metaDescription: row.metaDescription || null,
      email: row.contact?.email || contactData.email,
      phone: row.contact?.phone || null,
      address: row.contact?.address || 'Kim Hoa, Đống Đa, Hà Nội',
      stats: {
        stat1_value: row.stats?.stat1_value ?? 50,
        stat1_prefix: row.stats?.stat1_prefix ?? '',
        stat1_suffix: row.stats?.stat1_suffix ?? '',
        stat1_label: row.stats?.stat1_label || 'Dự án hoàn thành',

        stat2_value: row.stats?.stat2_value ?? 8,
        stat2_prefix: row.stats?.stat2_prefix ?? '',
        stat2_suffix: row.stats?.stat2_suffix ?? '+',
        stat2_label: row.stats?.stat2_label || 'Năm kinh nghiệm',

        stat3_value: row.stats?.stat3_value ?? 365,
        stat3_prefix: row.stats?.stat3_prefix ?? '',
        stat3_suffix: row.stats?.stat3_suffix ?? '',
        stat3_label: row.stats?.stat3_label || 'Ngày sáng tạo',
      },
      hero: {
        eyebrow: row.hero?.eyebrow || null,
        title: row.hero?.title || null,
        description: row.hero?.description || null,
        videoUrl: rawVideoUrl,
        posterImageUrl: row.hero?.posterImage ? coverUrl(row.hero.posterImage, 1920, 1080) : null,
      },
      portfolioTeaser: {
        tag: row.portfolioTeaser?.tag || '[ 01 / PORTFOLIO ]',
        title: row.portfolioTeaser?.title || null,
      },
      servicesTeaser: {
        tag: row.servicesTeaser?.tag || '[ 03 / SERVICES ]',
        title: row.servicesTeaser?.title || null,
      },
      contactBanner: {
        tag: row.contactBanner?.tag || '[ 04 / CONTACT ]',
        title: row.contactBanner?.title || null,
        text: row.contactBanner?.text || null,
      },
    };
  }
  return {
    seoTitle: null,
    metaDescription: null,
    email: contactData.email,
    phone: null,
    address: 'Kim Hoa, Đống Đa, Hà Nội',
    stats: {
      stat1_value: 50, stat1_prefix: '', stat1_suffix: '', stat1_label: 'Dự án hoàn thành',
      stat2_value: 8, stat2_prefix: '', stat2_suffix: '+', stat2_label: 'Năm kinh nghiệm',
      stat3_value: 365, stat3_prefix: '', stat3_suffix: '', stat3_label: 'Ngày sáng tạo',
    },
    hero: { eyebrow: null, title: null, description: null, videoUrl: null, posterImageUrl: null },
    portfolioTeaser: { tag: '[ 01 / PORTFOLIO ]', title: null },
    servicesTeaser: { tag: '[ 03 / SERVICES ]', title: null },
    contactBanner: { tag: '[ 04 / CONTACT ]', title: null, text: null },
  };
}

// ---------- Portfolio Page (singleton) ----------
export async function getPortfolioPage() {
  const row = await safeFetch(
    `*[_id in ["portfolio_page", "drafts.portfolio_page"]] | order(_updatedAt desc)[0]{
      eyebrow, heading, description
    }`
  );
  if (row) {
    return {
      eyebrow: row.eyebrow || '[ PORTFOLIO ]',
      heading: row.heading || 'Toàn bộ dự án quay dựng và chụp ảnh.',
      description: row.description || null,
    };
  }
  return {
    eyebrow: '[ PORTFOLIO ]',
    heading: 'Toàn bộ dự án quay dựng và chụp ảnh.',
    description: null,
  };
}

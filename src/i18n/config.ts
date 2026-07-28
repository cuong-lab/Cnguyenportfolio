// Locale configuration for the site. Kept dependency-free (no Astro imports)
// so both .astro frontmatter and plain build scripts can pull it in.
export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

// Vietnamese is the primary language; English is the secondary translation.
export const defaultLocale: Locale = 'vi';

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

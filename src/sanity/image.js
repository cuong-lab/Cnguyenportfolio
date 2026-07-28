import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

// Builds Sanity CDN image URLs (resize/crop/format handled by Sanity's image
// pipeline). Use `.width()/.height()/.fit()/.auto('format')` then `.url()`.
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source) {
  return builder.image(source);
}

// Video URL helpers shared by the gallery modal player (and any future SSR use).
// Turns a human-pasted YouTube/Vimeo link into a proper <iframe> embed URL.

/**
 * Normalize a YouTube/Vimeo watch/short link into an embeddable iframe URL.
 *
 * - YouTube (`youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`)
 *   -> `https://www.youtube.com/embed/ID` (no autoplay params — YouTube's
 *      autoplay policy rejects the player when they're forced on the URL)
 * - Vimeo (`vimeo.com/ID`, `vimeo.com/video/ID`)
 *   -> `https://player.vimeo.com/video/ID`
 * - Already an embed URL (`/embed/` or `player.vimeo.com`) -> returned unchanged.
 * - Anything else (incl. empty) -> returned as-is (caller decides what to do).
 *
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function getEmbedUrl(url) {
  if (!url) return '';

  // Already a canonical embed URL — leave it untouched (must be checked first,
  // since a YouTube embed URL also contains "youtube.com").
  if (/\/embed\/|player\.vimeo\.com/.test(url)) return url;

  // YouTube: watch?v=ID, youtu.be/ID, shorts/ID. The ID stops at the first
  // non-id char, so trailing &list=/?si= params are dropped cleanly.
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo: vimeo.com/ID or vimeo.com/video/ID.
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  return url;
}

/**
 * True when the URL points at a directly-playable video file (served via a
 * native <video> element rather than an iframe embed).
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export function isDirectVideoFile(url) {
  return !!url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/**
 * True when the URL is a recognised YouTube/Vimeo link or an existing embed URL.
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export function isEmbeddable(url) {
  return !!url && /youtube\.com|youtu\.be|vimeo\.com|\/embed\//.test(url);
}

/**
 * True when the URL is a YouTube Shorts link, which is inherently vertical
 * (9:16). Lets the modal auto-frame the player as vertical even when the manual
 * aspectRatio field wasn't set — otherwise a Short renders in a 16:9 frame with
 * black pillarbox bars.
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export function isShortsUrl(url) {
  return !!url && /youtube\.com\/shorts\//.test(url);
}

// Shared YouTube helpers for the Academy and Podcast pages.
// Thumbnails come from i.ytimg.com, which is allowed in next.config.ts (images.remotePatterns).

// YouTube video ID from a watch, youtu.be, shorts or embed link; null for anything else.
export function youtubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      return u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || null;
    }
  } catch {}
  return null;
}

// Privacy-enhanced embed player URL
export function youtubeEmbedUrl(url?: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

export function youtubeThumbnail(url?: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
}

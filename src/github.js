// Live open-source numbers from GitHub's public search API (no token; cached so a visit costs one request).

const CACHE_KEY = "portfolio:merged";
const CACHE_MS = 60 * 60 * 1000;

/** Search query for pull requests merged into other people's repositories. */
export const mergedQuery = (user) => `is:pr is:merged author:${user} -user:${user}`;

/** Turn search API items into the shape the page shows, newest first. */
export function toContributions(items) {
  return items
    .map((item) => ({
      repo: item.repository_url.replace("https://api.github.com/repos/", ""),
      number: item.number,
      title: item.title,
      url: item.html_url,
      mergedAt: (item.pull_request?.merged_at ?? item.closed_at ?? "").slice(0, 10),
    }))
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}

function readCache(storage, now) {
  try {
    const cached = JSON.parse(storage?.getItem(CACHE_KEY) ?? "null");
    if (cached && now - cached.at < CACHE_MS && Array.isArray(cached.items)) return cached;
  } catch {
    // Unreadable cache: fetch again.
  }
  return null;
}

/**
 * Merged pull requests to other people's projects, or null when GitHub can't be reached
 * (offline, rate limited). Callers fall back to the list in data.js.
 */
export async function fetchMerged(user, { fetchImpl = fetch, storage = globalThis.sessionStorage, now = Date.now() } = {}) {
  const cached = readCache(storage, now);
  if (cached) return cached;
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(mergedQuery(user))}&sort=updated&per_page=30`;
    const response = await fetchImpl(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) return null;
    const data = await response.json();
    const result = { at: now, total: data.total_count, items: toContributions(data.items ?? []) };
    try {
      storage?.setItem(CACHE_KEY, JSON.stringify(result));
    } catch {
      // Storage full or blocked: still use the result.
    }
    return result;
  } catch {
    return null;
  }
}

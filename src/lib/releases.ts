import { marked } from "marked";

export interface Release {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
  bodyHtml: string;
  prerelease: boolean;
  draft: boolean;
}

const REPO = "joshhearne/resolvd";
const API_URL = `https://api.github.com/repos/${REPO}/releases?per_page=50`;

let cache: { releases: Release[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

marked.setOptions({ gfm: true, breaks: false });

async function fetchFromGitHub(): Promise<Release[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "resolvd-dev-site",
  };
  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(API_URL, { headers });
    if (!res.ok) {
      console.warn(`[releases] GitHub API ${res.status}: ${res.statusText}`);
      return [];
    }
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((r: any) => !r.draft)
      .map((r: any) => ({
        tag: r.tag_name as string,
        name: (r.name as string) || (r.tag_name as string),
        publishedAt: r.published_at as string,
        url: r.html_url as string,
        bodyHtml: r.body ? marked.parse(r.body as string, { async: false }) as string : "",
        prerelease: Boolean(r.prerelease),
        draft: Boolean(r.draft),
      }));
  } catch (err) {
    console.warn("[releases] fetch failed:", err);
    return [];
  }
}

export async function getReleases(): Promise<Release[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.releases;
  }
  const releases = await fetchFromGitHub();
  cache = { releases, fetchedAt: Date.now() };
  return releases;
}

export async function getLatestRelease(): Promise<Release | null> {
  const releases = await getReleases();
  const stable = releases.find(r => !r.prerelease);
  return stable || releases[0] || null;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

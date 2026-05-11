import { getCollection, type CollectionEntry } from "astro:content";

export type DocEntry = CollectionEntry<"docs">;

function parseSemver(v: string): [number, number, number] {
  const m = v.replace(/^v/, "").split(".").map(n => parseInt(n, 10));
  return [m[0] || 0, m[1] || 0, m[2] || 0];
}

function compareVersionsDesc(a: string, b: string): number {
  const [aA, aB, aC] = parseSemver(a);
  const [bA, bB, bC] = parseSemver(b);
  if (aA !== bA) return bA - aA;
  if (aB !== bB) return bB - aB;
  return bC - aC;
}

export async function getAllDocs(): Promise<DocEntry[]> {
  return await getCollection("docs");
}

export async function listVersions(): Promise<string[]> {
  const docs = await getAllDocs();
  const versions = Array.from(new Set(docs.map(d => d.data.version)));
  versions.sort(compareVersionsDesc);
  return versions;
}

export async function getLatestVersion(): Promise<string> {
  const versions = await listVersions();
  return versions[0] ?? "v0.6.0";
}

export async function listTopics(version: string): Promise<DocEntry[]> {
  const docs = await getAllDocs();
  return docs
    .filter(d => d.data.version === version)
    .sort((a, b) => a.data.order - b.data.order);
}

export function topicSlug(entry: DocEntry): string {
  const id = entry.id;
  const trimmed = id.replace(/^v[^/]+\//, "").replace(/\.md$/, "");
  return trimmed;
}

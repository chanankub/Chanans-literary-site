import type { CollectionEntry } from "astro:content";

export function sortByOrderThenTitle<
  T extends { data: { order?: number; title: string } },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.data.title.localeCompare(b.data.title, "he");
  });
}

export function filterPublished<T extends { data: { draft?: boolean } }>(
  items: T[],
): T[] {
  return items.filter((item) => !item.data.draft);
}

export function formatHebrewDate(date: Date): string {
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Join site base with a path (safe whether BASE_URL ends with / or not). */
export function withBase(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  if (!path || path === "/") return base;
  return base + path.replace(/^\//, "");
}

/** Content entry id → URL slug (e.g. danse-russe.md → danse-russe). */
export function entrySlug(id: string): string {
  return id.replace(/\.md$/, "");
}

export type PoemEntry = CollectionEntry<"poems">;
export type StoryEntry = CollectionEntry<"stories">;
export type NoteEntry = CollectionEntry<"notes">;

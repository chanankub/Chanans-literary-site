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

export function sortPoemsByAuthorBirth<
  T extends { data: { authorBirth?: number; title: string } },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const birthA = a.data.authorBirth ?? Number.MAX_SAFE_INTEGER;
    const birthB = b.data.authorBirth ?? Number.MAX_SAFE_INTEGER;
    if (birthA !== birthB) return birthA - birthB;
    return a.data.title.localeCompare(b.data.title, "he");
  });
}

export function filterPublished<T extends { data: { draft?: boolean } }>(
  items: T[],
): T[] {
  return items.filter((item) => !item.data.draft);
}

/** Published content entries, excluding underscore drafts like _template.md. */
export function publishedContentEntries<
  T extends { id: string; data: { draft?: boolean } },
>(items: T[]): T[] {
  return filterPublished(items).filter((item) => !item.id.startsWith("_"));
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

/** e.g. Mary Oliver (1935–2019) or John Berryman (1914–1972*) */
export function formatPoetEnglishCredit(
  nameEn: string,
  birth?: number,
  death?: number,
  options?: { deathAsterisk?: boolean },
): string {
  const star = options?.deathAsterisk && death != null ? "*" : "";
  if (birth != null && death != null) {
    return `${nameEn} (${birth}–${death}${star})`;
  }
  if (birth != null) {
    return `${nameEn} (${birth}–)`;
  }
  if (death != null) {
    return `${nameEn} (–${death}${star})`;
  }
  return nameEn;
}

export type PoemEntry = CollectionEntry<"poems">;
export type StoryEntry = CollectionEntry<"stories">;
export type NoteEntry = CollectionEntry<"notes">;

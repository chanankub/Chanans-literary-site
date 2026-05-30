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

export type PoemEntry = CollectionEntry<"poems">;
export type StoryEntry = CollectionEntry<"stories">;
export type NoteEntry = CollectionEntry<"notes">;

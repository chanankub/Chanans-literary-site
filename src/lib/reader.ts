import { withBase } from "./content";

export type PieceKind = "poem" | "story" | "note";

export function isPieceKind(value: string): value is PieceKind {
  return value === "poem" || value === "story" || value === "note";
}

export function pieceHref(kind: PieceKind, slug: string): string {
  const section =
    kind === "poem" ? "translations" : kind === "story" ? "stories" : "notes";
  return withBase(`${section}/${slug}/`);
}

export function kindLabel(kind: PieceKind): string {
  if (kind === "poem") return "תרגום";
  if (kind === "story") return "סיפור";
  return "הערה";
}

/** Stay on this site. Drop the login page so a finished sign-in does not loop. */
export function safeNextPath(raw: string | null): string | null {
  if (!raw || raw.includes("://") || raw.includes("\\")) return null;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  if (!raw.startsWith(base)) return null;
  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? raw;
  if (pathOnly.replace(/\/?$/, "/").endsWith("/login/")) return null;
  return raw;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function nicknameFrom(profiles: unknown): string {
  const row = Array.isArray(profiles) ? profiles[0] : profiles;
  if (
    row &&
    typeof row === "object" &&
    "nickname" in row &&
    typeof row.nickname === "string"
  ) {
    return row.nickname;
  }
  return "";
}

export function loginRedirectUrl(): string {
  return `${location.origin}${withBase("login/")}`;
}

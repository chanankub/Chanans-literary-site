import { isPieceKind, nicknameFrom, type PieceKind } from "./reader";
import { getSupabase } from "./supabase";

type HoverComment = { nickname: string; body: string };

export async function mountCommentHover(kind: PieceKind): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return;

  const titles = [
    ...document.querySelectorAll<HTMLAnchorElement>("a[data-comment-title]"),
  ].filter((anchor) => anchor.dataset.kind === kind);
  if (titles.length === 0) return;

  const [commentsResult, readsResult] = await Promise.all([
    supabase
      .from("comments")
      .select("slug, body, profiles(nickname)")
      .eq("kind", kind)
      .eq("visibility", "public")
      .order("created_at", { ascending: true }),
    supabase
      .from("reads")
      .select("slug")
      .eq("user_id", session.user.id)
      .eq("kind", kind),
  ]);
  if (commentsResult.error || readsResult.error) return;

  const bySlug = new Map<string, HoverComment[]>();
  for (const row of commentsResult.data ?? []) {
    if (typeof row.slug !== "string" || typeof row.body !== "string") continue;
    const list = bySlug.get(row.slug) ?? [];
    list.push({ nickname: nicknameFrom(row.profiles), body: row.body });
    bySlug.set(row.slug, list);
  }
  const seen = new Set(
    (readsResult.data ?? [])
      .map((row) => row.slug)
      .filter((slug): slug is string => typeof slug === "string"),
  );

  const popover = document.createElement("div");
  popover.className = "comment-popover";
  popover.hidden = true;
  document.body.append(popover);

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let hideTimer = 0;
  let openSlug: string | null = null;

  const hide = () => {
    window.clearTimeout(hideTimer);
    popover.hidden = true;
    popover.replaceChildren();
    openSlug = null;
    for (const button of document.querySelectorAll<HTMLButtonElement>(
      ".comment-mark",
    )) {
      button.setAttribute("aria-expanded", "false");
    }
  };

  const show = (anchor: HTMLAnchorElement) => {
    const slug = anchor.dataset.slug;
    const anchorKind = anchor.dataset.kind ?? "";
    if (!slug || !isPieceKind(anchorKind)) return;
    const comments = bySlug.get(slug);
    if (!comments?.length) return;
    window.clearTimeout(hideTimer);
    openSlug = slug;
    popover.replaceChildren();
    for (const comment of comments) {
      const block = document.createElement("div");
      block.className = "comment-popover__item";
      const nick = document.createElement("p");
      nick.className = "comment-popover__nick";
      nick.textContent = comment.nickname;
      const body = document.createElement("p");
      body.className = "comment-popover__body";
      body.textContent = comment.body;
      block.append(nick, body);
      popover.append(block);
    }
    popover.hidden = false;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(352, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - width - 12,
    );
    popover.style.width = `${width}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(8, rect.bottom + 6)}px`;
  };

  for (const anchor of titles) {
    const slug = anchor.dataset.slug;
    if (!slug) continue;
    if (seen.has(slug)) {
      const seenMark = document.createElement("span");
      seenMark.className = "seen-mark";
      seenMark.textContent = "נראה";
      anchor.after(seenMark);
    }
    if (bySlug.get(slug)?.length) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "comment-mark";
      button.textContent = "תגובות";
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (openSlug === slug && !popover.hidden) {
          hide();
          return;
        }
        show(anchor);
        button.setAttribute("aria-expanded", "true");
      });
      anchor.after(button);
    }
    if (canHover) {
      anchor.addEventListener("mouseenter", () => show(anchor));
      anchor.addEventListener("mouseleave", () => {
        hideTimer = window.setTimeout(hide, 160);
      });
      anchor.addEventListener("focus", () => show(anchor));
      anchor.addEventListener("blur", () => {
        hideTimer = window.setTimeout(hide, 160);
      });
    }
  }

  if (canHover) {
    popover.addEventListener("mouseenter", () => window.clearTimeout(hideTimer));
    popover.addEventListener("mouseleave", () => {
      hideTimer = window.setTimeout(hide, 160);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (popover.contains(event.target)) return;
    if (
      event.target instanceof Element &&
      event.target.closest(".comment-mark")
    ) {
      return;
    }
    if (!popover.hidden) hide();
  });
}

import { withBase } from "./content";
import {
  formatWhen,
  isPieceKind,
  kindLabel,
  pieceHref,
  type PieceKind,
} from "./reader";
import { getSupabase } from "./supabase";

export async function mountSeen(root: HTMLElement): Promise<void> {
  const state = root.querySelector<HTMLElement>("[data-state]");
  const list = root.querySelector<HTMLElement>("[data-list]");
  const loginHref = root.dataset.loginHref ?? withBase("login/");
  if (!state || !list) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    const link = document.createElement("a");
    link.href = `${loginHref}?next=${encodeURIComponent(location.pathname)}`;
    link.textContent = "היכנסו";
    state.replaceChildren(
      link,
      document.createTextNode(" כדי לראות את מה שכבר נפתח."),
    );
    return;
  }

  const { data, error } = await supabase
    .from("reads")
    .select("kind, slug, title, last_seen")
    .eq("user_id", session.user.id)
    .order("last_seen", { ascending: false });

  if (error) {
    state.textContent = "לא הצלחנו לטעון את הרשימה.";
    return;
  }
  if (!data?.length) {
    state.textContent = "עדיין אין כאן קריאה שמורה.";
    return;
  }

  state.hidden = true;
  list.hidden = false;
  for (const row of data) {
    if (
      typeof row.kind !== "string" ||
      typeof row.slug !== "string" ||
      typeof row.title !== "string" ||
      !isPieceKind(row.kind)
    ) {
      continue;
    }
    list.append(seenItem(row.kind, row.slug, row.title, row.last_seen));
  }
}

function seenItem(
  kind: PieceKind,
  slug: string,
  title: string,
  lastSeen: unknown,
): HTMLLIElement {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = pieceHref(kind, slug);
  link.textContent = title;
  const meta = document.createElement("span");
  meta.className = "item-meta";
  const when = typeof lastSeen === "string" ? formatWhen(lastSeen) : "";
  meta.textContent = when ? `${kindLabel(kind)} · ${when}` : kindLabel(kind);
  li.append(link, meta);
  return li;
}

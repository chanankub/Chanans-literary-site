import { withBase } from "./content";
import {
  formatWhen,
  isPieceKind,
  kindLabel,
  nicknameFrom,
  pieceHref,
} from "./reader";
import { getSupabase } from "./supabase";

export async function mountInbox(root: HTMLElement): Promise<void> {
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
    state.replaceChildren(link, document.createTextNode(" כדי להמשיך."));
    return;
  }

  const { data: owner, error: ownerError } = await supabase.rpc("is_owner");
  if (ownerError || owner !== true) {
    state.textContent = "אין כאן הערות.";
    return;
  }

  const { data, error } = await supabase
    .from("comments")
    .select("kind, slug, body, created_at, profiles(nickname)")
    .eq("visibility", "private")
    .order("created_at", { ascending: false });

  if (error) {
    state.textContent = "לא הצלחנו לטעון את ההערות.";
    return;
  }
  if (!data?.length) {
    state.textContent = "אין כאן הערות.";
    return;
  }

  state.hidden = true;
  list.hidden = false;
  for (const row of data) {
    if (
      typeof row.kind !== "string" ||
      typeof row.slug !== "string" ||
      typeof row.body !== "string" ||
      !isPieceKind(row.kind)
    ) {
      continue;
    }
    const li = document.createElement("li");
    const nick = document.createElement("p");
    nick.className = "reader-comment__nick";
    const when =
      typeof row.created_at === "string" ? formatWhen(row.created_at) : "";
    nick.textContent = when
      ? `${nicknameFrom(row.profiles)} · ${when}`
      : nicknameFrom(row.profiles);
    const body = document.createElement("p");
    body.className = "reader-comment__body";
    body.textContent = row.body;
    const link = document.createElement("a");
    link.href = pieceHref(row.kind, row.slug);
    link.textContent = `אל היצירה · ${kindLabel(row.kind)}`;
    li.append(nick, body, link);
    list.append(li);
  }
}

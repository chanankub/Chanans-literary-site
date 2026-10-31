import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatWhen,
  isPieceKind,
  nicknameFrom,
  type PieceKind,
} from "./reader";
import { getSupabase } from "./supabase";

type CommentRow = {
  id: string;
  body: string;
  visibility: string;
  created_at: string;
  user_id: string;
  profiles: unknown;
};

export async function mountPieceEngagement(root: HTMLElement): Promise<void> {
  const kind = root.dataset.kind ?? "";
  const slug = root.dataset.slug ?? "";
  const title = root.dataset.title ?? "";
  if (!isPieceKind(kind) || !slug || !title) return;

  const panel = root.querySelector<HTMLElement>("[data-panel]");
  const invite = root.querySelector<HTMLElement>("[data-invite]");
  const form = root.querySelector<HTMLFormElement>("[data-form]");
  const publicList = root.querySelector<HTMLElement>("[data-public]");
  const privateWrap = root.querySelector<HTMLElement>("[data-private-wrap]");
  const privateList = root.querySelector<HTMLElement>("[data-private]");
  const message = root.querySelector<HTMLElement>("[data-message]");
  if (
    !panel ||
    !invite ||
    !form ||
    !publicList ||
    !privateWrap ||
    !privateList ||
    !message
  ) {
    return;
  }

  const supabase = getSupabase();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return;

  panel.hidden = false;

  const [{ data: profile }, { data: owner }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname")
      .eq("id", session.user.id)
      .maybeSingle(),
    supabase.rpc("is_owner"),
  ]);

  if (!profile?.nickname) {
    invite.hidden = false;
    return;
  }

  const userId = session.user.id;
  const isOwner = owner === true;
  invite.hidden = true;
  form.hidden = false;

  const { error: visitError } = await supabase.from("reads").upsert(
    {
      user_id: userId,
      kind,
      slug,
      title,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,kind,slug" },
  );
  if (visitError) {
    message.hidden = false;
    message.textContent = "הביקור לא נשמר.";
  }

  const load = () =>
    renderComments({
      supabase,
      kind,
      slug,
      userId,
      isOwner,
      publicList,
      privateWrap,
      privateList,
      message,
    });

  await load();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const bodyRaw = new FormData(form).get("body");
    const visibilityRaw = new FormData(form).get("visibility");
    const body = typeof bodyRaw === "string" ? bodyRaw.trim() : "";
    const visibility = visibilityRaw === "private" ? "private" : "public";
    if (!body || body.length > 2000) {
      message.hidden = false;
      message.textContent = "התגובה צריכה להיות עד 2000 תווים.";
      return;
    }
    const button = form.querySelector("button");
    if (button) button.disabled = true;
    const { error } = await supabase.from("comments").insert({
      user_id: userId,
      kind,
      slug,
      body,
      visibility,
    });
    if (button) button.disabled = false;
    if (error) {
      message.hidden = false;
      message.textContent = "לא הצלחנו לשמור את התגובה. נסו שוב.";
      return;
    }
    form.reset();
    const publicRadio = form.querySelector<HTMLInputElement>(
      'input[value="public"]',
    );
    if (publicRadio) publicRadio.checked = true;
    message.hidden = true;
    message.textContent = "";
    await load();
  });
}

async function renderComments(args: {
  supabase: SupabaseClient;
  kind: PieceKind;
  slug: string;
  userId: string;
  isOwner: boolean;
  publicList: HTMLElement;
  privateWrap: HTMLElement;
  privateList: HTMLElement;
  message: HTMLElement;
}): Promise<void> {
  const { data, error } = await args.supabase
    .from("comments")
    .select("id, body, visibility, created_at, user_id, profiles(nickname)")
    .eq("kind", args.kind)
    .eq("slug", args.slug)
    .order("created_at", { ascending: true });

  if (error) {
    args.message.hidden = false;
    args.message.textContent = "לא הצלחנו לטעון את התגובות.";
    return;
  }

  const rows = (data ?? []) as CommentRow[];
  args.publicList.replaceChildren();
  args.privateList.replaceChildren();

  for (const row of rows) {
    const comment = renderComment(row, args.userId, args.isOwner, async () => {
      const { error: deleteError } = await args.supabase
        .from("comments")
        .delete()
        .eq("id", row.id);
      if (deleteError) {
        args.message.hidden = false;
        args.message.textContent = "לא הצלחנו למחוק את התגובה.";
        return;
      }
      args.message.hidden = true;
      args.message.textContent = "";
      await renderComments(args);
    });
    if (row.visibility === "private") args.privateList.append(comment);
    else args.publicList.append(comment);
  }

  args.privateWrap.hidden = args.privateList.childElementCount === 0;
}

function renderComment(
  row: CommentRow,
  userId: string,
  isOwner: boolean,
  onDelete: () => Promise<void>,
): HTMLLIElement {
  const li = document.createElement("li");
  li.className =
    row.visibility === "private"
      ? "reader-comment reader-comment--private"
      : "reader-comment";

  const nick = document.createElement("p");
  nick.className = "reader-comment__nick";
  const who = nicknameFrom(row.profiles);
  const when = formatWhen(row.created_at);
  nick.textContent =
    row.visibility === "private"
      ? `${who} · הערה פרטית${when ? ` · ${when}` : ""}`
      : when
        ? `${who} · ${when}`
        : who;

  const body = document.createElement("p");
  body.className = "reader-comment__body";
  body.textContent = row.body;
  li.append(nick, body);

  if (row.user_id === userId || isOwner) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reader-text-button";
    button.textContent = "מחיקה";
    button.addEventListener("click", () => {
      if (!window.confirm("למחוק את התגובה?")) return;
      void onDelete();
    });
    li.append(button);
  }

  return li;
}

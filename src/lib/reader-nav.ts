import { withBase } from "./content";
import { safeNextPath } from "./reader";
import { getSupabase } from "./supabase";

function item(...nodes: Node[]): HTMLLIElement {
  const li = document.createElement("li");
  li.append(...nodes);
  return li;
}

export async function mountReaderNav(root: HTMLElement): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const loginHref = root.dataset.loginHref ?? withBase("login/");
  const seenHref = root.dataset.seenHref ?? withBase("seen/");
  const inboxHref = root.dataset.inboxHref ?? withBase("inbox/");
  const link = root.querySelector("a");

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    const next = safeNextPath(location.pathname);
    if (link && next) {
      link.href = `${loginHref}?next=${encodeURIComponent(next)}`;
    }
    return;
  }

  const [{ data: profile, error: profileError }, { data: owner }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("nickname")
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase.rpc("is_owner"),
    ]);

  if (profileError || !link) return;

  if (!profile?.nickname) {
    link.href = loginHref;
    link.textContent = "בחירת כינוי";
    return;
  }

  const name = document.createElement("span");
  name.className = "reader-nav__name";
  name.textContent = profile.nickname;

  const seen = document.createElement("a");
  seen.href = seenHref;
  seen.textContent = "מה ראיתי";

  const signOut = document.createElement("button");
  signOut.type = "button";
  signOut.textContent = "יציאה";
  signOut.addEventListener("click", async () => {
    signOut.disabled = true;
    await supabase.auth.signOut();
    location.reload();
  });

  const items = [item(name), item(seen), item(signOut)];
  if (owner === true) {
    const inbox = document.createElement("a");
    inbox.href = inboxHref;
    inbox.textContent = "הערות פרטיות";
    items.push(item(inbox));
  }
  root.replaceChildren(...items);
}

import { withBase } from "./content";
import { safeNextPath } from "./reader";
import { getSupabase } from "./supabase";

/** Titles stay visible. The piece body opens only for a signed-in reader. */
export async function openPieceIfSignedIn(): Promise<void> {
  const bodies = document.querySelectorAll<HTMLElement>("[data-piece-body]");
  const gates = document.querySelectorAll<HTMLElement>("[data-piece-gate]");
  const summaries = document.querySelectorAll<HTMLElement>(
    "[data-piece-summary]",
  );
  if (!bodies.length && !gates.length && !summaries.length) return;

  const supabase = getSupabase();
  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;

  if (!session) {
    const next = safeNextPath(`${location.pathname}${location.search}`);
    const href = next
      ? `${withBase("login/")}?next=${encodeURIComponent(next)}`
      : withBase("login/");
    document
      .querySelectorAll<HTMLAnchorElement>("[data-piece-gate-link]")
      .forEach((link) => {
        link.href = href;
      });
    gates.forEach((gate) => {
      gate.hidden = false;
    });
    return;
  }

  bodies.forEach((body) => {
    body.hidden = false;
  });
  summaries.forEach((summary) => {
    summary.hidden = false;
  });
}

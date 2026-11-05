import type { Session, SupabaseClient } from "@supabase/supabase-js";

const stayKey = "reader-stay";

type Stay = {
  access_token: string;
  refresh_token: string;
};

/** Keep the latest tokens so כניסה in this browser can return without a new email. */
export function rememberSession(session: Session | null): void {
  if (!session?.access_token || !session.refresh_token) return;
  const stay: Stay = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
  localStorage.setItem(stayKey, JSON.stringify(stay));
}

export function hasRememberedSession(): boolean {
  return localStorage.getItem(stayKey) !== null;
}

export async function restoreRememberedSession(
  supabase: SupabaseClient,
): Promise<Session | null> {
  const raw = localStorage.getItem(stayKey);
  if (!raw) return null;
  let stay: Stay;
  try {
    stay = JSON.parse(raw) as Stay;
  } catch {
    localStorage.removeItem(stayKey);
    return null;
  }
  if (!stay.access_token || !stay.refresh_token) {
    localStorage.removeItem(stayKey);
    return null;
  }
  const { data, error } = await supabase.auth.setSession(stay);
  if (error || !data.session) {
    localStorage.removeItem(stayKey);
    return null;
  }
  rememberSession(data.session);
  return data.session;
}

/**
 * Lock reading on this visit without revoking the saved sign-in.
 * signOut() calls /logout and kills the refresh token, so the next כניסה would email a new link.
 */
export async function lockVisit(supabase: SupabaseClient): Promise<void> {
  const { data } = await supabase.auth.getSession();
  rememberSession(data.session);
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("sb-") && key.includes("-auth-token")) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

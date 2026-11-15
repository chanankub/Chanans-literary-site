import type { AuthError } from "@supabase/supabase-js";
import { withBase } from "./content";
import { loginRedirectUrl, safeNextPath } from "./reader";
import {
  hasRememberedSession,
  restoreRememberedSession,
} from "./reader-session";
import { getSupabase } from "./supabase";

const rememberedEmailKey = "reader-email";

const expiredLinkMessage =
  "הקישור כבר לא בתוקף. בקשו קישור חדש, ופתחו אותו בדפדפן הזה.";
const otherBrowserMessage =
  "הקישור נפתח בדפדפן אחר. חזרו לדפדפן שבו ביקשתם אותו, או בקשו קישור חדש.";
const genericLinkMessage = "הכניסה לא הושלמה. בקשו קישור חדש ופתחו אותו כאן.";

type AuthCallback = {
  tokenHash: string;
  type: string;
  error: string;
  errorCode: string;
  errorDescription: string;
};

function readAuthCallback(): AuthCallback {
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const pick = (key: string) => query.get(key) ?? hash.get(key) ?? "";
  return {
    tokenHash: pick("token_hash"),
    type: pick("type"),
    error: pick("error"),
    errorCode: pick("error_code"),
    errorDescription: pick("error_description"),
  };
}

function stripParams(keys: readonly string[]): void {
  const url = new URL(location.href);
  for (const key of keys) url.searchParams.delete(key);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  let touched = false;
  for (const key of keys) {
    if (!hash.has(key)) continue;
    hash.delete(key);
    touched = true;
  }
  if (touched) {
    const rest = hash.toString();
    url.hash = rest ? `#${rest}` : "";
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${location.pathname}${location.search}${location.hash}`;
  if (next !== current) history.replaceState(null, "", next);
}

function linkFailureMessage(code: string, description: string): string {
  const blob = `${code} ${description}`.toLowerCase();
  if (
    blob.includes("verifier") ||
    blob.includes("pkce") ||
    blob.includes("code challenge")
  ) {
    return otherBrowserMessage;
  }
  if (
    blob.includes("otp_expired") ||
    blob.includes("expired") ||
    blob.includes("already")
  ) {
    return expiredLinkMessage;
  }
  return genericLinkMessage;
}

function isTransientAuthError(error: AuthError): boolean {
  if (error.status != null && error.status >= 500) return true;
  if (error.status != null && error.status !== 0) return false;
  const blob = error.message.toLowerCase();
  return (
    blob.includes("fetch") ||
    blob.includes("network") ||
    blob.includes("timeout") ||
    blob.includes("load failed")
  );
}

function sendFailureMessage(error: AuthError): string {
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "נשלחו כבר שני קישורי כניסה בשעה האחרונה. חכו כשעה, בקשו קישור אחד, ופתחו אותו באותו דפדפן.";
  }
  const blob = `${error.code ?? ""} ${error.message}`.toLowerCase();
  if (blob.includes("redirect")) {
    return "לא הצלחנו לשלוח את הקישור. כתובת החזרה אינה מורשית.";
  }
  return "לא הצלחנו לשלוח את הקישור. נסו שוב.";
}

export async function mountLogin(root: HTMLElement): Promise<void> {
  const callback = readAuthCallback();
  stripParams(["error", "error_code", "error_description"]);

  const supabase = getSupabase();
  if (!supabase) return;

  const signinForm = root.querySelector<HTMLFormElement>("[data-signin-form]");
  const nicknameForm = root.querySelector<HTMLFormElement>(
    "[data-nickname-form]",
  );
  const status = root.querySelector<HTMLElement>("[data-status]");
  const title = root.querySelector<HTMLElement>("[data-login-title]");
  const emailInput = signinForm?.querySelector<HTMLInputElement>(
    'input[name="email"]',
  );
  if (!signinForm || !nicknameForm || !status || !emailInput) return;

  const showStatus = (message: string) => {
    status.hidden = message.length === 0;
    status.textContent = message;
  };

  const showSignin = () => {
    if (title) title.textContent = "כניסה";
    const remembered = localStorage.getItem(rememberedEmailKey);
    if (remembered && !emailInput.value) emailInput.value = remembered;
    signinForm.hidden = false;
    nicknameForm.hidden = true;
    emailInput.focus();
  };

  const showNickname = () => {
    if (title) title.textContent = "בחירת כינוי";
    signinForm.hidden = true;
    nicknameForm.hidden = false;
    showStatus("");
  };

  const requested = safeNextPath(
    new URLSearchParams(location.search).get("next"),
  );
  if (requested) sessionStorage.setItem("reader-next", requested);

  const goNext = () => {
    const stored = safeNextPath(sessionStorage.getItem("reader-next"));
    sessionStorage.removeItem("reader-next");
    location.assign(stored ?? withBase());
  };

  const nicknameFor = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .maybeSingle();
    return profile?.nickname ?? "";
  };

  let left = false;
  const enter = async (userId: string) => {
    if (left) return;
    if (await nicknameFor(userId)) {
      left = true;
      goNext();
      return;
    }
    showNickname();
  };

  nicknameForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data: currentData } = await supabase.auth.getSession();
    const current = currentData.session;
    if (!current) {
      showStatus("הכניסה פגה. בקשו קישור חדש.");
      showSignin();
      return;
    }
    const raw = new FormData(nicknameForm).get("nickname");
    const nickname = typeof raw === "string" ? raw.trim() : "";
    if (!nickname || nickname.length > 40) {
      showStatus("הכינוי צריך להיות עד 40 תווים.");
      return;
    }
    const button = nicknameForm.querySelector("button");
    if (button) button.disabled = true;
    const { error } = await supabase.from("profiles").insert({
      id: current.user.id,
      nickname,
    });
    if (button) button.disabled = false;
    if (error) {
      showStatus("לא הצלחנו לשמור את הכינוי. נסו שוב.");
      return;
    }
    left = true;
    goNext();
  });

  let callbackMessage = "";
  if (callback.tokenHash && callback.type === "magiclink") {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: callback.tokenHash,
      type: "magiclink",
    });
    if (!error && data.session) {
      stripParams(["token_hash", "type"]);
      showStatus("נכנסים…");
      await enter(data.session.user.id);
      return;
    }
    if (!error || !isTransientAuthError(error)) {
      stripParams(["token_hash", "type"]);
    }
    callbackMessage = linkFailureMessage(
      error?.code ?? "",
      error?.message ?? "",
    );
  } else if (callback.tokenHash) {
    stripParams(["token_hash", "type"]);
    callbackMessage = genericLinkMessage;
  } else if (callback.error || callback.errorCode || callback.errorDescription) {
    callbackMessage = linkFailureMessage(
      callback.errorCode || callback.error,
      callback.errorDescription,
    );
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    showStatus("נכנסים…");
    await enter(sessionData.session.user.id);
    return;
  }

  const hadStay = hasRememberedSession();
  if (hadStay) showStatus("נכנסים…");
  const restored = hadStay ? await restoreRememberedSession(supabase) : null;
  if (restored) {
    await enter(restored.user.id);
    return;
  }

  showSignin();
  if (callbackMessage) showStatus(callbackMessage);
  else if (hadStay && hasRememberedSession()) {
    showStatus("לא הצלחנו לשחזר את הכניסה. נסו שוב.");
  } else if (hadStay) {
    showStatus("הכניסה השמורה פגה. אפשר לבקש קישור אחד חדש.");
  } else {
    showStatus("");
  }

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, next) => {
      if (event === "SIGNED_IN" && next) void enter(next.user.id);
    },
  );

  const sendLink = async () => {
    const { data: currentData } = await supabase.auth.getSession();
    if (currentData.session) {
      await enter(currentData.session.user.id);
      return;
    }
    const email = emailInput.value.trim();
    if (!email) return;
    const button = signinForm.querySelector<HTMLButtonElement>("[data-send-link]");
    if (button) button.disabled = true;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: loginRedirectUrl() },
    });
    if (button) button.disabled = false;
    if (error) {
      showStatus(sendFailureMessage(error));
      return;
    }
    localStorage.setItem(rememberedEmailKey, email);
    signinForm.hidden = true;
    showStatus(
      'הקישור נשלח בדוא"ל מאת \u2066Supabase\u2069. ליחצו על הקישור המסומן \u2066Sign in\u2069. תוקפו יפוג תוך זמן קצר.',
    );
  };

  signinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showStatus("");
    void sendLink();
  });

  window.addEventListener("pagehide", () => authListener.subscription.unsubscribe());
}

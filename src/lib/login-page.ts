import { withBase } from "./content";
import { loginRedirectUrl, safeNextPath } from "./reader";
import {
  hasRememberedSession,
  restoreRememberedSession,
} from "./reader-session";
import { getSupabase } from "./supabase";

const rememberedEmailKey = "reader-email";

export async function mountLogin(root: HTMLElement): Promise<void> {
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
  showStatus(hadStay ? "הכניסה השמורה פגה. אפשר לבקש קישור אחד חדש." : "");

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
      const limited =
        error.code === "over_email_send_rate_limit" || error.status === 429;
      showStatus(
        limited
          ? "נשלחו כבר שני קישורי כניסה בשעה האחרונה. חכו כשעה, בקשו קישור אחד, ופתחו אותו באותו דפדפן."
          : "לא הצלחנו לשלוח את הקישור. נסו שוב.",
      );
      return;
    }
    localStorage.setItem(rememberedEmailKey, email);
    signinForm.hidden = true;
    showStatus("הקישור נשלח. פתחו אותו בדפדפן הזה, והכניסה תישמר בו.");
  };

  signinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showStatus("");
    void sendLink();
  });

  window.addEventListener("pagehide", () => authListener.subscription.unsubscribe());
}

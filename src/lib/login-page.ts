import { withBase } from "./content";
import { loginRedirectUrl, safeNextPath } from "./reader";
import { getSupabase } from "./supabase";

export async function mountLogin(root: HTMLElement): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const signinForm = root.querySelector<HTMLFormElement>("[data-signin-form]");
  const offer = root.querySelector<HTMLElement>("[data-signin-offer]");
  const nicknameForm = root.querySelector<HTMLFormElement>(
    "[data-nickname-form]",
  );
  const status = root.querySelector<HTMLElement>("[data-status]");
  const title = root.querySelector<HTMLElement>("[data-login-title]");
  if (!signinForm || !offer || !nicknameForm || !status) return;

  const showStatus = (message: string) => {
    status.hidden = message.length === 0;
    status.textContent = message;
  };

  const showSignin = () => {
    if (title) title.textContent = "כניסה";
    signinForm.hidden = false;
    nicknameForm.hidden = true;
    signinForm.querySelector("input")?.focus();
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

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (session && (await nicknameFor(session.user.id))) {
    goNext();
    return;
  }
  if (session) {
    if (title) title.textContent = "בחירת כינוי";
    signinForm.hidden = true;
    nicknameForm.hidden = false;
    showStatus("");
  } else {
    showSignin();
    showStatus("");
  }

  const sendLink = async () => {
    const email = new FormData(signinForm).get("email");
    if (typeof email !== "string" || !email.trim()) return;
    const button = signinForm.querySelector<HTMLButtonElement>("[data-send-link]");
    if (button) button.disabled = true;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
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
    signinForm.hidden = true;
    showStatus("הקישור נשלח. פתחו אותו בדפדפן הזה.");
  };

  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    offer.hidden = true;
    showStatus("");
    const raw = new FormData(signinForm).get("email");
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!email) return;
    const { data: currentData } = await supabase.auth.getSession();
    const current = currentData.session;
    const same = current?.user.email?.toLowerCase() === email;
    if (current && same) {
      if (await nicknameFor(current.user.id)) {
        goNext();
        return;
      }
      if (title) title.textContent = "בחירת כינוי";
      signinForm.hidden = true;
      nicknameForm.hidden = false;
      return;
    }
    offer.hidden = false;
  });

  signinForm
    .querySelector("[data-send-link]")
    ?.addEventListener("click", () => {
      void sendLink();
    });

  nicknameForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data: currentData } = await supabase.auth.getSession();
    const current = currentData.session;
    if (!current) {
      showStatus("הכניסה פגה. בקשו קישור חדש.");
      nicknameForm.hidden = true;
      offer.hidden = false;
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
    goNext();
  });
}

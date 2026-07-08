/** Cusdis comments + mailing list — set PUBLIC_* vars at build time (see .env.example). */

export const cusdis = {
  host: import.meta.env.PUBLIC_CUSDIS_HOST ?? "https://cusdis.com",
  appId: import.meta.env.PUBLIC_CUSDIS_APP_ID ?? "",
};

export function isCommentsConfigured(): boolean {
  return Boolean(cusdis.appId);
}

export const mailingList = {
  buttondownUser: import.meta.env.PUBLIC_BUTTONDOWN_USER ?? "",
};

export function isMailingListConfigured(): boolean {
  return Boolean(mailingList.buttondownUser);
}

export const contactEmail = import.meta.env.PUBLIC_CONTACT_EMAIL ?? "";

/** Full public URL for the contact page (used by Cusdis). */
export function contactPageUrl(): string {
  const site = import.meta.env.SITE.replace(/\/?$/, "");
  const base = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/?$/, "");
  return `${site}/${base}/contact/`;
}

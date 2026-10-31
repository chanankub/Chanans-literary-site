/** Reader login — set PUBLIC_SUPABASE_* at build time (see .env.example). */

export function isReaderLoginConfigured(): boolean {
  return Boolean(
    import.meta.env.PUBLIC_SUPABASE_URL &&
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  );
}
